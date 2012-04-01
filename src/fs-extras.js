var exec = require('child_process').exec;
var Path = require('path');
var Async = require('async');
var CommonUtils = require('../lib/common-utils');

exports.copyDirectoryContents = copyDirectoryContents;
exports.getListOfFiles = getListOfFiles;

var PsScriptDirectory = Path.resolve(__filename, '../../ps');

function copyDirectoryContents(source, destination, callback) {
    var copyDirContentsScriptFullName = Path.join(PsScriptDirectory, 'copy-directory-contents.ps1');

    executePowershellScript(copyDirContentsScriptFullName, [source, destination], callback);
}

function getListOfFiles(directory, callback) {
    var getListOfFilesScriptFullName = Path.join(PsScriptDirectory, 'get-list-of-files.ps1');

    Async.waterfall([
        function (done) {
            executePowershellScript(getListOfFilesScriptFullName, [directory], done);
        },

        function (stdout, done) {
            try {
                var list = JSON.parse(stdout);
                done(null, list);
            } catch (e) {
                done('Error while parsing file list: ' + e.message);
            }
        }
    ],

    function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result);
        }
    });
}

function executePowershellScript(scriptFileName, parameters, callback) {
    var error = null;

    error = checkScriptFileName(scriptFileName);
    if (error) {
        callback(error);
    }

    error = checkParameters(parameters);
    if (error) {
        callback(error);
    }

    var commandString = 'powershell -ExecutionPolicy RemoteSigned -File ' +
                        '"' + scriptFileName + '" ';

    var i;
    var len;
    for (i = 0, len = parameters.length; i < len; i++) {
        commandString += '"' + parameters[i]+ '" ';
    }

    var childProcess = exec(commandString, function (err, stdout, stderr) {
        if (err || stderr) {
            var errorMessage = 'Error while executing Powershell script: ' + stderr;
            callback(errorMessage);
        } else {
            callback(null, stdout);
        }
    });
    childProcess.stdin.end();
}

function checkScriptFileName(scriptFileName) {
    if (!CommonUtils.isNotEmptyString(scriptFileName)) {
        return 'scriptFileName should be not empty string';
    }

    if (!Path.existsSync(scriptFileName)) {
        return 'scriptFileName does not exist';
    }

    return null;
}

function checkParameters(parameters) {
    if (!Array.isArray(parameters)) {
        return 'Parameters should be an array';
    }

    return null;
}
