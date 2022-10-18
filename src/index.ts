import {Parser} from "acorn";
import jsx from "acorn-jsx";
import fs from 'fs';
import glob from 'glob';
import path from 'path';

import {fileURLToPath} from 'url';

import type {Node} from 'acorn';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSXParser = Parser.extend(jsx());

const fileContent: Record<string, string> = {
    react: `import { FC } from "react";`
};

const enum PropertyType {
    BOOLEAN = 'boolean',
    NUMBER = 'number',
    STRING = 'string',
    FUNCTION = '() => void',
    ANY = 'any',
}

const propToType: Record<string, PropertyType> = {
    bool: PropertyType.BOOLEAN,
    number: PropertyType.NUMBER,
    string: PropertyType.STRING,
    func: PropertyType.FUNCTION,
    any: PropertyType.ANY,
}

const getPropType = (str: string): PropertyType => {
    const propType = propToType[str];
    return propType ? propType : PropertyType.ANY;
}

const getTypeForOneOf = (property = '', values: Array<{value: string}> = []): string => {
    const typeName = property[0].toUpperCase() + property.slice(1);
    fileContent[property] = `export type ${typeName} = ${values.map(({value}) => `"${value}"`).join(' | ')};`;
    return typeName;
}

interface Property {
    name: string;
    type: PropertyType | string;
    mandatory: boolean;
}

const isOneOf = (node: Node): boolean => node.type === 'CallExpression' && node.callee.property.name === 'oneOf';

const getTypeForNode = (prop: Node): Property => {
    if (prop.type === 'SpreadElement') {
        return { name: '', type: PropertyType.ANY, mandatory: false };
    }
    const property = prop.key.name;
    const node = prop.value;
    try {
        if (isOneOf(node)) {
            return {
                name: property,
                mandatory: false,
                type: getTypeForOneOf(property, node.arguments[0].elements),
            }
        } else {
            if (node.property.name === 'isRequired') {
                return {
                    name: property,
                    type: node.object.type === 'CallExpression'
                        ? getTypeForOneOf(property, node.object.arguments[0].elements)
                        : getPropType(node.object.property.name),
                    mandatory: true,
                }
            }
            return {
                name: property,
                type: getPropType(node.property.name),
                mandatory: false,
            };
        }
    } catch(e) {
        console.error(`ERROR getTypeForNode => ${property}`, e);
        return {
            name: property,
            type: PropertyType.ANY,
            mandatory: false,
        }
    }

}

const propertyToString = ({name, mandatory, type}: Property): string => {
    return name ? `${name}${mandatory ? '' : '?'}: ${type}` : '';
}

const buildInterface = (interfaceName: string, properties: Array<Node>): string => {
    const propsInterfaceName = `${interfaceName}Props`;
    return `
export interface ${propsInterfaceName} {
  ${properties.map((prop) => propertyToString(getTypeForNode(prop)))
    .filter(e => !!e)
    .join('\n  ')}
}

declare const ${interfaceName}: FC<${propsInterfaceName}>`;
};

const dir = process.argv.find(e => e.indexOf('dir') !== -1)?.split('=').pop();
const out = process.argv.find(e => e.indexOf('out') !== -1)?.split('=').pop();

glob('**/*.jsx', { cwd: dir,}, (err: Error | null, matches: string[]) => {
    if (err) {
        console.error(err);
        return;
    }
    matches.filter((v) => v.indexOf('__tests__') === -1 )
        .forEach(fileName => generateDeclaration(`${dir}/${fileName}`));
    fs.writeFileSync(`${__dirname}/../generated/index.d.ts`, Object.values(fileContent).join('\n'));
});

const generateDeclaration = (filePath: string) => {
    console.log('generating file ', filePath)
    const content = fs.readFileSync(filePath).toString('utf-8');
    const ast = JSXParser.parse(content, {ecmaVersion: 'latest', sourceType: 'module'});
    const expressions: Array<Node> = ast.body.filter(({type}: Node) => type === 'ExpressionStatement');

    expressions.forEach(({expression}) => {
        const {left: {object: {name: className}, property}, right} = expression;
        if (property.name === 'propTypes') {
            fileContent[className] = buildInterface(className, right.properties);
        }
    });
}
