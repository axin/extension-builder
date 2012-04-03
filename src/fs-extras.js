var exec = require('child_process').exec;
var Fs = require('fs');
var Path = require('path');
var Async = require('async');
var CommonUtils = require('../lib/common-utils');

exports.copyDirectoryContents = copyDirectoryContents;
exports.getListOfChilditems = getListOfChilditems;
exports.makeSubstitutionsInChilditemNames = makeSubstitutionsInChilditemNames;

var PsScriptsDirectory = Path.resolve(__filename, '../../ps');

function copyDirectoryContents(source, destination, callback) {
    var copyDirContentsScriptFullName = Path.join(PsScriptsDirectory, 'copy-directory-contents.ps1');

    executePowershellScript(copyDirContentsScriptFullName, [source, destination], callback);
}

function getListOfChilditems(directory, callback) {
    var getListOfChilditemsScriptFullName = Path.join(PsScriptsDirectory, 'get-list-of-childitems.ps1');

    Async.waterfall([
        function (done) {
            executePowershellScript(getListOfChilditemsScriptFullName, [directory], done);
        },

        function (stdout, done) {
            try {
                var list = JSON.parse(stdout);
            } catch (e) {
                done('Error while parsing JSON: ' + e.message);
            }
            done(null, list);
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

function makeSubstitutionsInChilditemNames(pattern, substitution, childitemNames, callback) {
    var items = CommonUtils.cloneObject(childitemNames);
    sortArrayOfStringsByLengthInDescendingOrder(items);

    // Do not replace with forEach!!!
    Async.forEachSeries(items, function (item, done) {
        makeSubstitutionInChilditemName(pattern, substitution, item, done);
    }, callback);
}

function sortArrayOfStringsByLengthInDescendingOrder(arr) {
    var len = arr.length;

    for (var i = 0; i < len; i++) {
        for (var j = len - 1; j > i; j--) {
            if (arr[j].length > arr[j - 1].length) {
                var tmp = arr[j - 1];
                arr[j - 1] = arr[j];
                arr[j] = tmp;
            }
        }
    }
}

function makeSubstitutionInChilditemName(pattern, substitution, childitemName, callback) {
    var dirName = Path.dirname(childitemName);
    var baseName = Path.basename(childitemName);

    var newBaseName = baseName.replace(pattern, substitution);
    var newName = Path.join(dirName, newBaseName);

    Fs.rename(childitemName, newName, callback);
}

function executePowershellScript(scriptFileName, parameters, callback) {
    var error = null;

    error = checkScriptFileName(scriptFileName);
    if (error) {
        callback(error);
        return;
    }

    error = checkScriptParameters(parameters);
    if (error) {
        callback(error);
        return;
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

function checkScriptParameters(parameters) {
    if (!Array.isArray(parameters)) {
        return 'Parameters should be an array';
    }

    return null;
}
