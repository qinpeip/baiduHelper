const path = require("path");
const merge = require("webpack-merge");
const base = require("./webpack.base.config");
const fs = require('fs')


process.env.NODE_ENV !== 'development'&&deleteFolderRecursive('./dist')
function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file) {
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


module.exports = env => {
  return merge(base(env), {
    entry: {
      background: "./src/index.js",
      app: './src/assets/js/home.js'
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../app")
    }
  });
};
