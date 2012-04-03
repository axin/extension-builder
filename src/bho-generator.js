var Path = require('path');
var Async = require('async');
var CommonUtils = require('../lib/common-utils');

exports.createBho = generateBhoSource;

var bhoTemplateDirectory = Path.resolve(__filename, '../../templates/bho');

function generateBhoSource(extensionManifest, outputDirectory, templateData, callback) {
    var error = checkParameters();
    if (error) {
        callback(error);
        return;
    }

    var extensionName = extensionManifest['extension-name'];

//    EfUtils.executePowershellScript(copyDirectoryContentScriptFullName,
//        [bhoTemplateDirectory, outputDirectory], function (stdout) {
//            EfUtils.executePowershellScript(makeSubstitutionsInFileAndDirectoryNamesScriptFullName,
//                ['{{extensionName}}', extensionName, outputDirectory], function (stdout) {
//                    EfUtils.executePowershellScript(getFileListScriptFullName,
//                        [outputDirectory], function (stdout) {
//                            var files = JSON.parse(stdout);
//                            // TODO: write mustache-template-file-parser
//                        });
//                });
//        });

    function checkParameters() {
        var error = null;

        error = checkExtensionManifest(extensionManifest);
        if (error) {
            return error;
        }

        error = checkOutputDirectory(outputDirectory);
        if (error) {
            return error;
        }

        error = checkTemplateData(templateData);
        if (error) {
            return error;
        }

        error = checkBhoTemplateDirectory(bhoTemplateDirectory);
        if (error) {
            return error;
        }

        return error;
    }

    function checkExtensionManifest(extensionManifest) {
        if (!CommonUtils.isNotNullObject(extensionManifest)) {
            return 'extensionManifest should be not null object';
        }

        // TODO: check for extensionManifest['extinsion-name']

        return null;
    }

    function checkOutputDirectory(outputDirectory) {
        if (!CommonUtils.isNotEmptyString(outputDirectory)) {
            return 'outputDirectory should be not empty string';
        }

        return null;
    }

    function checkTemplateData(templateData) {
        if (!CommonUtils.isNotNullObject(templateData)) {
            return'templateData should be not null object';
        }

        return null;
    }

    function checkBhoTemplateDirectory(bhoTemplateDirectory) {
        if (!CommonUtils.isNotEmptyString(bhoTemplateDirectory)) {
            return 'bhoTemplateDirectory should be not empty string';
        }

        if (!Path.existsSync(bhoTemplateDirectory)) {
            return 'bhoTemplateDirectory does not exist';
        }

        return null;
    }
}

