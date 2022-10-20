import fs from 'fs';
import { generateDeclaration } from './generate-declaration-components.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const findParam = (param: string): string =>
  process.argv
    .find((e) => e.indexOf(param) !== -1)
    ?.split('=')
    .pop();

const dir = findParam('--dir');

// const out = findParam('--out');

(() => {
  generateDeclaration({ dir })
    .then((fileContent) => {
      const filePath = `${__dirname}/../generated/index.${new Date().toISOString()}.d.ts`;
      fs.writeFileSync(filePath, Object.values(fileContent).join('\n'));
    })
    .catch(console.error);
})();
