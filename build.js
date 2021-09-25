const fs = require('fs-extra');
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');    // require
const resolve = require('rollup-plugin-node-resolve'); // require from node_modules
const terser = require('rollup-plugin-terser').terser; // minify
const json = require('@rollup/plugin-json');
const prettier = require('rollup-plugin-prettier');

const MODULE_NAME = 'PF2EncounterPlanner';
const MODULE_FILENAME = 'pf2_encounter_planner';

async function build(inputOptions, outputOptions) {
    // create a bundle
    const bundle = await rollup.rollup(inputOptions);

    // generate code and a sourcemap
    const { code, map } = await bundle.generate(outputOptions);

    // or write the bundle to disk
    await bundle.write(outputOptions);

    if (outputOptions.copyFile)
        await fs.copy(outputOptions.file, outputOptions.copyFile);

    console.log("Built ", outputOptions.file)
}

/*******************************************
 *  Debug build
 ******************************************/

build({
    input: 'src/module.js',
    plugins:  [ commonjs(), resolve(), json() ],
    external: [],
}, {
    format: 'umd',
    name: MODULE_NAME,
    file: `./build/${MODULE_FILENAME}.js`,
    globals: {}
});


console.log("Build at " + new Date());


/*******************************************
 *  Minified build
 ******************************************/

build({
    input: 'src/module.js',
    plugins:  [
        commonjs(),
        resolve(),
        json(),
        terser(),
        prettier({
            parser: 'babel',
            tabWidth: 0,
            singleQuote: false,
            bracketSpacing:false
        })
    ],
    external: [],
}, {
    format: 'umd',
    name: MODULE_NAME,
    file: `./build/${MODULE_FILENAME}.min.js`,
    globals: {}
});
