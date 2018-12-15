const fs = require('fs')
const path = require('path');

class LaravelMixFilenameVersioning {
  apply (compiler) {
    compiler.plugin('done', function(stats) {
      const newAssets = {};
      Object.keys(stats.compilation.assets).forEach(assetName => {
		let fixedAssetName = assetName.replace(/\\/g, '/');
        let originalAssetNameParts = path.parse(fixedAssetName.replace(/\\/g, '/'));
        let newAssetFile = new File(path.join(Config.publicPath, fixedAssetName).replace(/\\/g, '/')); 
        let newAssetFileName = newAssetFile.segments.name + '.' + newAssetFile.version().substr(0, 8) + newAssetFile.segments.ext;
        newAssetFile.rename(newAssetFileName.replace(/\\/g, '/'));

        let newAssetKeyName = path.join(originalAssetNameParts.dir, newAssetFileName).replace(/\\/g, '/');
        let newAssetFullFileName = path.join(newAssetFile.segments.base, newAssetFileName);
        newAssets[newAssetKeyName.replace(/\\/g, '/')] = stats.compilation.assets[assetName];

        if (newAssets[newAssetKeyName.replace(/\\/g, '/')].hasOwnProperty('existsAt')) {
          newAssets[newAssetKeyName.replace(/\\/g, '/')].existsAt = newAssetFullFileName;
        }
        if (newAssets[newAssetKeyName.replace(/\\/g, '/')].hasOwnProperty('absolutePath')) {
          newAssets[newAssetKeyName.replace(/\\/g, '/')].absolutePath = newAssetFullFileName;
        }

        // this is only a fix for the incorrect asset binding in CustomTaskPlugins.js
        newAssets[newAssetKeyName.replace(/\\/g, '/')].size = function (assetAbsolutePath) {
          return new File(assetAbsolutePath).size();
        }.bind(null, newAssetFullFileName);
        Mix.manifest.manifest[fixedAssetName] = newAssetKeyName.replace(/\\/g, '/');
      });

      Mix.manifest.refresh();
      stats.compilation.assets = newAssets;
    });
  }
}

module.exports = LaravelMixFilenameVersioning;
