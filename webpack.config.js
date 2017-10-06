const webpack = require("webpack");
const path = require("path");

var jF = path.resolve(__dirname,"scripts");
var bF = path.resolve(__dirname,"build");

var config = {
    entry:{
        "index":jF +"/index.js"
    },
    output:{
        filename:"[name]bundle.js",
        path:bF
    },
    plugins:[
        new webpack.ProvidePlugin({
            $:"jquery",
            jQuery:"jquery"
        })
    ]
}

module.exports = config;