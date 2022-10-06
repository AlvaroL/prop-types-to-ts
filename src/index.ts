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

const propToType: Record<string, string> = {
    bool: 'boolean',
    number: 'number',
    string: 'string',
    func: '() => void',
}

const getTypeForOneOf = (property = '', values = []): string => {
    const typeName = property[0].toUpperCase() + property.slice(1);
    fileContent[property] = `export type ${typeName} = ${values.map(({value}) => `"${value}"`).join(' | ')};`;
    return typeName;
}

const getTypeForNode = (property = '', node: Node): string => {
    if (node.type === 'CallExpression' && node.callee.property.name === 'oneOf') {
        return getTypeForOneOf(property, node.arguments[0].elements)
    } else {
        return propToType[node.property.name ];
    }
}


const buildInterface = (interfaceName: string, properties: Array<Node>) => {
  const newInterface = `
export interface ${interfaceName} {
  ${properties.map((prop) => `${prop.key.name}: ${getTypeForNode(prop.key.name, prop.value)}`).join(';\n  ')}
}`
    fileContent[interfaceName] = newInterface;
};

expressions.forEach(({expression}) => {
    const {left: {object: {name: className}, property}, right} = expression;
    if (property.name === 'propTypes') {
        buildInterface(className, right.properties);
        fs.writeFileSync(`${__dirname}/../generated/index.${new Date().toISOString()}.d.ts`, Object.values(fileContent).join('\n\n'))
    }
});



console.log(ast.childNodes);


