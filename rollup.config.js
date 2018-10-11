import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import browsersync from 'rollup-plugin-browsersync'
// import serve from 'rollup-plugin-serve'
// import livereload from 'rollup-plugin-livereload'
// import builtins from 'rollup-plugin-node-builtins';
// import globals from 'rollup-plugin-node-globals';

export default {
    input: 'my-app.js',
    output: {
        file: './bundle.js',
        format: 'iife'
    },
    name: 'MyModule',
    plugins: [
        // builtins(),
        resolve(),
        commonjs(),
        // browsersync({server: 'output'})
        // serve(),
        // livereload()
    ]
};