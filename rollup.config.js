import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start:https', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
    input: 'src/main.ts',
    output: {
		name: 'app',
        file: 'public/build/main.js',
        format: 'iife',
		sourcemap: !production,
    },
    plugins: [
		svelte({
			preprocess: sveltePreprocess({
				sourceMap: !production,
			}),
			compilerOptions: {
				dev: !production
			}
		}),
        resolve({
			browser: true,
			dedupe: ['svelte'],
		}),
        commonjs(),
        typescript({
            sourceMap: !production,
            inlineSources: !production,
        }),
		!production && serve(),
		!production && livereload('public'),
		production && terser()
    ],
	watch: {
		clearScreen: false
	}
};
