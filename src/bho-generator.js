var Path = require('path');
var Async = require('async');
var CommonUtils = require('../lib/common-utils');
var FsExtras = require('./fs-extras');
var MustacheExtras = require('./mustache-extras');

exports.generateBhoSource = generateBhoSource;

var bhoTemplateDirectory = Path.resolve(__filename, '../../templates/bho');

function generateBhoSource(outputDirectory, templateData, callback) {
    var error = checkParameters();
    if (error) {
        callback(error);
        return;
    }

    Async.waterfall([
        function (done) {
            FsExtras.copyDirectoryContents(bhoTemplateDirectory, outputDirectory, done);
        },

        function (stdout, done) {
            FsExtras.getListOfChilditems(outputDirectory, done);
        },

        function (childitems, done) {
            FsExtras.makeSubstitutionsInChilditemNames('{{{extensionName}}}', templateData.extensionName,
                childitems, done);
        },

        function (done) {
            FsExtras.getListOfFiles(outputDirectory, done)
        },

        function (files, done) {
            MustacheExtras.renderFiles(files, templateData, done);
        }
    ],

    function (err, result) {
        if (err) {
            return callback(err);
        } else {
            return callback(null);
        }
    });

    function checkParameters() {
        var error = null;

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
