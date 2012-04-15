var Program = require('commander');
var Path = require('path');
var Async = require('async');
var Fs = require('fs');
var rimraf = require('rimraf');
var BhoGenerator = require('./bho-generator');
var JsonFileParser = require('./json-file-parser');

Program
    .version('1.0')
    .option('-d, --directory [path]', 'Directory with extension manifest')
    .parse(process.argv);

var extensionDir = Path.resolve(Program.directory);
var manifestFile = Path.join(extensionDir, './manifest.json');
checkCmdArguments();

function checkCmdArguments() {
    if (!extensionDir) {
        exitWithError('Extension directory is not specified');
    }
}

function exitWithError(errorMessage) {
    console.error(errorMessage);
    process.exit(1);
}

Async.waterfall([
    function (done) {
        Path.exists(manifestFile, function (manifestExists) {
            if (!manifestExists) {
                return done('Manifest file does not exist in directory ' + extensionDir);
            } else {
                return done(null);
            }
        });
    },

    function (done) {
        JsonFileParser.parseJsonFile(manifestFile, done);
    },

    function (parsedManifest, done) {
        var templateData = {};

        templateData.extensionName = parsedManifest['name'] || 'Untitled';
        templateData.extensionVersion = parsedManifest['version'] || '1.0';
        templateData.extensionAuthor = parsedManifest['author'] || '';
        templateData.extensionDescription = parsedManifest['description'] || '';
        templateData.currentYear = (new Date()).getFullYear();

        done(null, templateData, parsedManifest);
    },

    function (templateData, parsedManifest, done) {
        var outputDir = Path.join(extensionDir, parsedManifest['output-dir'] || 'output');

        rimraf(outputDir, function () {
            Fs.mkdir(outputDir, function () {
                BhoGenerator.generateBhoSource(outputDir, templateData, done);
            });
        });
    }
],

function (err, result) {
    if (err) {
        exitWithError(err);
    }
});
