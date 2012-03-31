var Async = require('async');
var Fs = require('fs');
var Path = require('path');
var CommonUtils = require('../lib/common-utils');

exports.parseJsonFile = parseJsonFile;

function parseJsonFile(fileName, callback) {
    Async.waterfall([
        function checkFileName(done) {
            if (!CommonUtils.isNotEmptyString(fileName)) {
                done('fileName should be not empty string');
            } else {
                Path.exists(fileName, function (exists) {
                    if (!exists) {
                        done('File ' + fileName + ' does not exist');
                    } else {
                        done(null);
                    }
                });
            }
        },

        function readJsonFile(done) {
            Fs.readFile(fileName, 'utf8', function (err, data) {
                if (err) {
                    done('Cannot read file ' + fileName + '. Reason: ' + err);
                } else {
                    done(null, data);
                }
            });
        },

        function parseReadData(data, done) {
            try {
                var parsedData = JSON.parse(data);
            } catch (e) {
                done('Error while parsing file contents');
            }

            done(null, parsedData);
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
