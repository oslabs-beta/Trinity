"use strict";
exports.__esModule = true;
// const fs = require("fs");
var path = require("path");
var fs = require("fs");
// const path = require('path');
var find = require("find");
var getFilePath = function (directoryName, fileName) {
    var configPath = [];
    var directoryToCheck = directoryName;
    while (configPath.length < 1) {
        configPath = find.fileSync(fileName, directoryToCheck);
        if (configPath.length < 1) {
            directoryToCheck = path.resolve(directoryToCheck, "../");
        }
    }
    return configPath[0];
};
exports.getConfigSetup = function (directoryName) {
    var configPath = getFilePath(directoryName, ".trinity.json");
    var trinityConfigString = fs.readFileSync(configPath, "utf-8");
    var trinityConfig = JSON.parse(trinityConfigString);
    return trinityConfig;
};
console.log(exports.getConfigSetup(__dirname));
