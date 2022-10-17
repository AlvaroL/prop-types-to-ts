import {Parser} from "acorn";
import jsx from "acorn-jsx";
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

import type {Node} from 'acorn';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSXParser = Parser.extend(jsx());

const FILE_NAME = `${__dirname}/tests/Person.jsx`;
const content = fs.readFileSync(FILE_NAME).toString('utf-8');

const ast = JSXParser.parse(content, {ecmaVersion: 'latest', sourceType: 'module'});
const expressions: Array<Node> = ast.body.filter(({type}: Node) => type === 'ExpressionStatement');

const fileContent: Record<string, string> = {};

const enum PropertyType {
    BOOLEAN = 'boolean',
    NUMBER = 'number',
    STRING = 'string',
    FUNCTION = '() => void',
}

const propToType: Record<string, PropertyType> = {
    bool: PropertyType.BOOLEAN,
    number: PropertyType.NUMBER,
    string: PropertyType.STRING,
    func: PropertyType.FUNCTION,
}

const getTypeForOneOf = (property = '', values = []): string => {
    const typeName = property[0].toUpperCase() + property.slice(1);
    fileContent[property] = `export type ${typeName} = ${values.map(({value}) => `"${value}"`).join(' | ')};`;
    return typeName;
}

interface Property {
    name: string;
    type: PropertyType | string;
    mandatory: boolean;
}


const getTypeForNode = (property = '', node: Node): Property => {
    if (node.type === 'CallExpression' && node.callee.property.name === 'oneOf') {
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
                    : propToType[node.object.property.name],
                mandatory: true,
            }
        }
        return {
            name: property,
            type: propToType[node.property.name],
            mandatory: false,
        };
    }
}

const propertyToString = ({name, mandatory, type}: Property): string => {
    return `${name}${mandatory ? '' : '?'}: ${type}`;
}

const buildInterface = (interfaceName: string, properties: Array<Node>) => {
  const newInterface = `
export interface ${interfaceName} {
  ${properties.map((prop) => `${propertyToString(getTypeForNode(prop.key.name, prop.value))}`).join(';\n  ')}
}`
    fileContent[interfaceName] = newInterface;
};

expressions.forEach(({expression}) => {
    const {left: {object: {name: className}, property}, right} = expression;
    if (property.name === 'propTypes') {
        buildInterface(className, right.properties);
        const fileName = FILE_NAME.split('/').pop();
        const tsFileName = fileName.replace('.jsx', '.ts');
        fs.writeFileSync(`${__dirname}/../generated/${tsFileName}`, Object.values(fileContent).join('\n\n'));
    }
});

console.log('Done writing file');
