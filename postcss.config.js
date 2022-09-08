const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const plugins = [tailwindcss, autoprefixer];

if (process.env.NODE_ENV === "production") {
	plugins.push(cssnano);
}

module.exports = { plugins };
