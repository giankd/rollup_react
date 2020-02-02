import typescript from '@rollup/plugin-typescript';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import clear from 'rollup-plugin-clear';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const outputDir = './public/js';

const getPluginsConfig = (prod, mini) => {
	const config = [
		clear({
			targets: [`${outputDir}`],
			watch: true
		}),
		typescript(),
		nodeResolve({
			jsnext: true,
			browser: true,
			preferBuiltins: false
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify(
				prod ? 'production' : 'development'
			)
		}),
		commonjs({
			include: 'node_modules/**',
			namedExports: {
				'./node_modules/react/index.js': [
					'cloneElement',
					'createElement',
					'PropTypes',
					'Children',
					'Component',
					'createFactory',
					'PureComponent',
					'lazy',
					'Suspense',
					'useState',
					'useEffect'
				],
				'./node_modules/react-dom/index.js': ['findDOMNode'],
				'./node_modules/babel-runtime/node_modules/core-js/library/modules/es6.object.to-string.js': [
					'default'
				],
				'./node_modules/process/browser.js': ['nextTick'],
				'./node_modules/events/events.js': ['EventEmitter'],
				'./node_modules/react-is/index.js': ['isValidElementType']
			}
		}),
		babel({
			exclude: 'node_modules/**'
		}),
		globals(),
		builtins()
	];
	if (mini) {
		config.push(
			terser({
				compress: {
					unused: false,
					collapse_vars: false
				},
				output: {
					comments: !prod
				},
				sourcemap: true
			})
		);
	}
	if (!prod) {
		config.push(
			serve({
				open: true,
				contentBase: './public',
				host: 'localhost',
				port: 3030,
				headers: {
					'Access-Control-Allow-Origin': '*'
				}
			}),
			livereload()
		);
	}
	return config;
};

export default args => {
	const prod = !!args.prod;
	const mini = !!args.mini;
	const ruConfig = {
		input: './src/index.tsx',
		output: {
			file: `${outputDir}/bundle.js`,
			format: 'cjs'
		},
		watch: {
			include: './src/**'
		}
	};
	ruConfig.plugins = getPluginsConfig(prod, mini);
	return ruConfig;
};
