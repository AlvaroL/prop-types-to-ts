# prop-types-to-ts

Naive parser from prop-types definitions to a unique index.d.ts file that can later be used to create real interfaces and classes.

This pet project was intended firstly to help document via declaration file a JS library.

It is written in TS and uses acorn + jsx-acorn to read and traverse the AST of every document.
Have a look at [https://astexplorer.net/](https://astexplorer.net/) to see how an AST looks on a component


## Usage


Take this info with care as I am writting it from the back of my head :S
Firstly install the dependencies:
```sh
npm i
```
Then you need to `tsc` the code to get executable code, there is a command for that (clean first the `dist` directory):
```sh
npm run clean && npm run ts:generate
```

Then run the program:
```sh
node dir/index.js --dir=/path/to/your/js/files --out=/path/to/your/output/dir
```

It accepts an input path (--dir) were it will look for files and an out full filename path to generate the index.d.ts (--out). Both params are directory paths, for example:
```sh
node dir/index.js --dir=/home/AlvaroL/code/some-repo/src --out=/home/AlvaroL/tmp/some-repo-declaration
```
