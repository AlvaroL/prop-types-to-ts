import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import fs from 'fs';
import glob from 'glob';

import type { Node } from 'acorn';

const JSXParser = Parser.extend(jsx());

const fileContent: Record<string, string> = {
  react: `import { FC, ReactNode } from "react";`,
  callbackFunc: `type CallbackFunc = (args?: any) => void | Promise<void>`,
};

const enum PropertyType {
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  STRING = 'string',
  FUNCTION = 'CallbackFunc',
  ANY = 'any',
  NODE = 'ReactNode',
  OBJECT = 'object',
}

const propToType: Record<string, PropertyType> = {
  bool: PropertyType.BOOLEAN,
  number: PropertyType.NUMBER,
  string: PropertyType.STRING,
  func: PropertyType.FUNCTION,
  any: PropertyType.ANY,
  node: PropertyType.NODE,
  object: PropertyType.OBJECT,
};

const getPropType = (str: string): PropertyType => propToType[str] || PropertyType.ANY;

const getTypeForOneOf = (values: Array<{ value: string }> = []): string => {
  const possibleValues = values.filter(({ value }) => !!value).map(({ value }) => `"${value}"`);
  return possibleValues.length ? possibleValues.join(' | ') : 'any';
};

interface Property {
  name: string;
  type: PropertyType | string;
  mandatory: boolean;
}

const isExpression = ({ type }: Node): boolean => type === 'CallExpression';
const isOneOf = (node: Node): boolean => isExpression(node) && node.callee.property.name === 'oneOf';
const isOneOfType = (node: Node): boolean => isExpression(node) && node.callee.property.name === 'oneOfType';
const isArrayOf = (node: Node): boolean => isExpression(node) && node.callee.property.name === 'arrayOf';

const getTypesForCollection = (collection: Node[]): PropertyType[] =>
  collection.map((n: Node) => {
    if (isOneOfType(n) || isArrayOf(n)) return PropertyType.ANY;
    return getPropType(n.property.name);
  });

const getTypeForNode = (prop: Node): Property => {
  if (prop.type === 'SpreadElement') {
    return undefined;
  }

  const property = prop.key.name;
  const node = prop.value;
  if (property === 'children') {
    return { name: property, type: PropertyType.NODE, mandatory: false };
  }
  try {
    if (isOneOf(node)) {
      return {
        name: property,
        mandatory: false,
        type: getTypeForOneOf(node.arguments[0].elements),
      };
    } else if (isOneOfType(node)) {
      return {
        name: property,
        type: getTypesForCollection(node.arguments[0].elements).join(' | '),
        mandatory: false,
      };
    } else if (isArrayOf(node)) {
      return {
        name: property,
        type: getTypesForCollection(node.arguments).join(' | '),
        mandatory: false,
      };
    } else if (isExpression(node) && node.callee.property.name === 'shape') {
      const type = node.arguments[0].properties.reduce((acc: object, n: Node) => {
        return Object.assign(acc, { [n.key.name]: propToType[n.value.property.name] });
      }, {});

      return {
        name: property,
        type: JSON.stringify(type, undefined, 2).replaceAll('"', ''),
        mandatory: false,
      };
    } else {
      if (node.property.name === 'isRequired') {
        return {
          name: property,
          type:
            node.object.type === 'CallExpression'
              ? getTypeForOneOf(node.object.arguments[0].elements)
              : getPropType(node.object.property.name),
          mandatory: true,
        };
      }
      return {
        name: property,
        type: getPropType(node.property.name),
        mandatory: false,
      };
    }
  } catch (e) {
    console.error(`ERROR getTypeForNode => [${property}]`, e);
    return {
      name: property,
      type: PropertyType.ANY,
      mandatory: false,
    };
  }
};

const propertyToString = (prop: Property | undefined): string => {
  return prop ? `${prop.name}${prop.mandatory ? '' : '?'}: ${prop.type}` : '';
};

const getHookDeclaration = (hookName: string, propsName: string): string =>
  `declare const ${hookName}: (args?: any) => ${propsName}`;
const getInterfaceDeclaration = (interfaceName: string, propsInterfaceName: string): string =>
  `declare const ${interfaceName}: FC<${propsInterfaceName} & StylerProperties>;`;

const buildInterface = (interfaceName: string, properties: Array<Node>): string => {
  const propsInterfaceName = `${interfaceName}Props`;
  return `
export interface ${propsInterfaceName} {
  ${properties
    .map((prop) => propertyToString(getTypeForNode(prop)))
    .filter((e) => !!e)
    .join('\n  ')}
}
${
  interfaceName.startsWith('use')
    ? getHookDeclaration(interfaceName, propsInterfaceName)
    : getInterfaceDeclaration(interfaceName, propsInterfaceName)
}
`;
};

type DeclarationFunctionParams = { dir: string; initialLoad?: Record<string, string> };
type DeclarationFunction = ({ dir, initialLoad }: DeclarationFunctionParams) => Promise<Record<string, string>>;

const generateDeclaration: DeclarationFunction = async ({ dir, initialLoad = {} }) => {
  return new Promise((resolve, reject) => {
    Object.entries(initialLoad).forEach(([key, value]) => (fileContent[key] = value));
    glob('**/*.jsx', { cwd: dir }, (err: Error | null, matches: string[]) => {
      if (err) {
        reject(err as Error);
      }
      matches
        .filter((v) => v.indexOf('__tests__') === -1)
        .forEach((fileName) => generateDeclarationForFile(`${dir}/${fileName}`));
      resolve(fileContent);
    });
  });
};

const generateDeclarationForFile = (filePath: string) => {
  console.log('generating file ', filePath);
  const content = fs.readFileSync(filePath).toString('utf-8');
  const ast = JSXParser.parse(content, { ecmaVersion: 'latest', sourceType: 'module' });
  const expressions: Array<Node> = ast.body.filter(({ type }: Node) => type === 'ExpressionStatement');

  expressions.forEach(({ expression }) => {
    const {
      left: {
        object: { name: className },
        property,
      },
      right,
    } = expression;
    if (property.name === 'propTypes') {
      if (className === 'useDevice') {
        debugger;
      }
      fileContent[className] = buildInterface(className, right.properties);
    }
  });
};

export { generateDeclaration };
