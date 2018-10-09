import reslove from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
// import globals from 'rollup-plugin-node-globals';

export default {
    input: 'my-app.js',
    output: {
        file: './bundle.js',
        format: 'iife'
    },
    name: 'MyModule',
    plugins: [
        builtins(),
        reslove(),
        commonjs()
    ]
};