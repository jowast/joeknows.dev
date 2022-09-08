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
				loader: 'loader 700ms cubic-bezier(0.65, 0, 0.35, 1) infinite alternate',
			},
      colors: {
        "shade-light": "#3d3846",
        "shade-dark": "#241f31"
      },
			fontFamily: {
				sans: ['Lato', 'Helvetica', 'Arial', 'sans-serif'],
			},
			keyframes: {
				loader: {
					'0%': {
						transform: 'translateY(0)',
						maxHeight: '8px',
					},
					'100%': {
						transform: 'translateY(16px)',
						maxHeight: '24px',
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

