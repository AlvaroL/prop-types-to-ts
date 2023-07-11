import fs from 'fs';
import { generateDeclaration } from './generate-declaration-components.js';
import { StylerProperties } from './StylerProperties.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const findParam = (param: string): string =>
  process.argv
    .find((e) => e.indexOf(param) !== -1)
    ?.split('=')
    .pop();

const dir = findParam('--dir');
const out = findParam('--out');

const initialLoad = {
  stylerProps: StylerProperties,
};

(() => {
  generateDeclaration({ dir, initialLoad })
    .then((fileContent) => {
      const filePath = `${__dirname}/../generated/index.d.ts`;
      fs.writeFileSync(filePath, Object.values(fileContent).join('\n'));
      fs.copyFile(
        `${__dirname}/../generated/index.d.ts`,
        out,
        (err) => (err ? console.error(err) : console.log('done copying file')),
      );
    })
    .catch(console.error);
})();
