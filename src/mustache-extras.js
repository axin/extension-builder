var Async = require('async');
var Fs = require('fs');
var Mustache = require('mustache');

exports.renderFile = renderFile;
exports.renderFiles = renderFiles;

function renderFile(fileName, templateData, callback) {
    Async.waterfall([
        function (done) {
            Fs.readFile(fileName, 'utf-8', done);
        },

        function (template, done) {
            var renderedTemplate = Mustache.render(template, templateData);
            done(null, renderedTemplate);
        },

        function (renderedTemplate, done) {
            Fs.writeFile(fileName, renderedTemplate, 'utf-8', done);
        }
    ],

    function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function renderFiles(files, templateData, callback) {
    Async.forEachSeries(files, function (item, done) {
        renderFile(item, templateData, done);
    }, callback);
}
