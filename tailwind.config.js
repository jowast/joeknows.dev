const defaultTheme = require('tailwindcss/defaultTheme');

const production = process.env.NODE_ENV === 'production';

module.exports = {
	purge: {
		enabled: production,
		content: ['./src/**/*.svelte', './src/**/*.ts'],
		options: {
			defaultExtractor: content => [
				...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
				...(content.match(/(?<=class:)[^=>\/\s]*/g) || []),
			],
		},
	},
	darkMode: false,
	theme: {
		extend: {
			animation: {
				loader: 'loader 750ms linear infinite alternate',
			},
			colors: {
				splash: '#1c1c24',
			},
			fontFamily: {
				sans: ['Outfit', 'Helvetica', 'Arial', 'sans-serif'],
			},
			keyframes: {
				loader: {
					'0%': {
						transform: 'translateY(0)',
						maxHeight: '8px',
					},
					'50%': {
						transform: 'translateY(16px)',
						maxHeight: '24px',
					},
					'100%': {
						transform: 'translateY(32px)',
						maxHeight: '8px',
					},
				},
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: []
};

