var Program = require('commander');
var Path = require('path');
var Async = require('async');
var Fs = require('fs');
var rimraf = require('rimraf');
var FsExtras = require('./fs-extras');
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

var settings;
var winSdkLocation;
var msbuildLocation;

var outputDir;
var bhoTemplateManifest;

Async.waterfall([
    function (done) {
        var settingsFile = Path.resolve(__filename, "../../settings.json");

        JsonFileParser.parseJsonFile(settingsFile, done);
    },

    function (parsedSettings, done) {
        settings = parsedSettings;
        winSdkLocation = settings["win-sdk-location"];
        msbuildLocation = settings["msbuild-location"];
        done(null);
    },

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

        Async.waterfall([
            function (wfDone) {
                var keysFile = Path.join(extensionDir, './keys.json');

                Path.exists(keysFile, function (exists) {
                    wfDone(null, exists);
                });
            },

            function (exists, wfDone) {
                var pathToKeysFile = Path.join(extensionDir, './keys.json');

                if (exists) {
                    JsonFileParser.parseJsonFile(pathToKeysFile, function (err, result) {
                        templateData.bhoClassGuid = result['bho-clsid'];
                        templateData.assemblyGuid = result['bho-assembly-guid'];
                        templateData.snkFile = Path.resolve(extensionDir, result['snk-file']);

                        FsExtras.generateGuid(function (err, res) {
                            templateData.projectGuid = res;
                            wfDone(null);
                        });
                    });
                } else {
                    Async.map([null, null, null],
                        function (arg, callback) {
                            FsExtras.generateGuid(callback);
                        },

                        function (err, results) {
                            var guids = results;
                            var snkFileName = templateData.extensionAuthor + '.snk';
                            var pathToSnkFile = Path.join(extensionDir, './' + snkFileName);

                            FsExtras.generateSnkFile(winSdkLocation, pathToSnkFile, function (err, result) {
                                var KeysJsonTemplate = '{"bho-clsid":"{{{bhoClassGuid}}}","bho-assembly-guid":"{{{assemblyGuid}}}","snk-file":"{{{nskFile}}}"}';
                                KeysJsonTemplate = KeysJsonTemplate.replace('{{{bhoClassGuid}}}', guids[0]);
                                KeysJsonTemplate = KeysJsonTemplate.replace('{{{assemblyGuid}}}', guids[1]);
                                KeysJsonTemplate = KeysJsonTemplate.replace('{{{nskFile}}}', './' + snkFileName);

                                Fs.writeFile(pathToKeysFile, KeysJsonTemplate, 'utf-8', function () {
                                    templateData.bhoClassGuid = guids[0];
                                    templateData.assemblyGuid = guids[1];
                                    templateData.projectGuid = guids[2];
                                    templateData.snkFile = pathToSnkFile;
                                    wfDone(null);
                                });
                            });
                        });
                }
            }
        ],

        function (err, result) {
            done(null, templateData, parsedManifest);
        });
    },

    function (templateData, parsedManifest, done) {
        outputDir = Path.join(extensionDir, parsedManifest['output-dir'] || 'output');
        bhoTemplateManifest = Path.join(outputDir, './template.json');

        if (parsedManifest['content-scripts']) {
            templateData.contentScripts = parsedManifest['content-scripts'].map(function (scriptFile) {
                return Path.join(extensionDir, scriptFile);
            });
        }

        rimraf(outputDir, function () {
            Fs.mkdir(outputDir, function () {
                BhoGenerator.generateBhoSource(outputDir, templateData, done);
            });
        });
    },

    function (done) {
        JsonFileParser.parseJsonFile(bhoTemplateManifest, function (err, result) {
            var projectFile = Path.join(outputDir, result['project-file']);

            FsExtras.buildProject(msbuildLocation, projectFile, function (err) {
                done(null);
            });
        });
    }
],

function (err, result) {
    if (err) {
        exitWithError(err);
    }
});
