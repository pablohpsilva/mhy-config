const ManifestPlugin = require('webpack-manifest-plugin')

module.exports.default = (plugins = []) => {
	return plugins.concat([
		new ManifestPlugin({
			fileName: './manifest.json',
		})
	])
}

