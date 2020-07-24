var fs = require('fs-extra');
var rollup = require('rollup');
var commonjs = require('rollup-plugin-commonjs');    // require
var resolve = require('rollup-plugin-node-resolve'); // require from node_modules
var terser = require('rollup-plugin-terser').terser; // minify
var json = require('@rollup/plugin-json');
var prettier = require('rollup-plugin-prettier');

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