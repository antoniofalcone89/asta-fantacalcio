// Webpack uses this to work with directories
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// This is the main configuration object.
// Here you write different options and tell Webpack what to do
module.exports = {

// Path to your entry point. From this file Webpack will begin his work
entry: './src/javascript/index.js',

// Path and filename of your result bundle.
// Webpack will bundle all JavaScript into this file
output: {
	path: path.resolve(__dirname, 'dist'),
	filename: 'main.js'
},

// Default mode for Webpack is production.
// Depending on mode Webpack will apply different things
// on final bundle. For now we don't need production's JavaScript 
// minifying and other thing so let's set mode to development
mode: 'development',
module: {
	rules: [
		{
			test: /\.js$/,
			loader: "babel-loader",
			exclude: /(node_modules)/
		},
		{
			test: /\.js$/,
		},
		{
			// Apply rule for .sass, .scss or .css files
			test: /\.(sa|sc|c)ss$/,

			// Set loaders to transform files.
			// Loaders are applying from right to left(!)
			// The first loader will be applied after others
			use: [
				{
					// This loader resolves url() and @imports inside CSS
					loader: MiniCssExtractPlugin.loader,
				},
				{
					loader: "css-loader"
				},
				{
					// Then we apply postCSS fixes like autoprefixer and minifying
					loader: "postcss-loader"
				},
				{
				// First we transform SASS to standard CSS
					loader: "sass-loader",
						options: {
							implementation: require("sass")
						}
				}
			]
		},
		{
			// Apply rule for images files
			test: /\.(png|svg|jpg|gif)$/,
			loader:	"file-loader",
			options: {
				outputPath: 'images',
			},
		},
		{
			test: /\.csv$/,
			loader: 'file-loader',
			options: {
				outputPath: '.',
			},
		},
		{
			// HTML LOADER
			test: /\.html$/,
			loader: 'html-loader'
		}
	]
},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "bundle.css"
		}),
		new HtmlWebpackPlugin({
			template: 'index.html',
			inject: 'body',
		}),
		new CleanWebpackPlugin({ cleanStaleWebpackAssets: false })
	]
};