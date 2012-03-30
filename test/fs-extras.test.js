var Chai = require('chai');
var Jack = require('jack');
var Path = require('path');
var Async = require('async');
var rimraf = require('rimraf');
var FsExtras = require('../src/fs-extras');

Chai.use(Jack.chai);
var expect = Chai.expect;

describe('FsExtras', function () {
    describe('copyDirectoryContents()', function () {
        it('Should copy directory contents', function (done) {
            var bhoTemplateDir = Path.resolve(__filename, '../../templates/bho');
            var tempDir = Path.join(__filename, '../temp');
            var templateFile = Path.join(tempDir, './template.json');

            Async.series([
                function (callback) {
                    FsExtras.copyDirectoryContents(bhoTemplateDir, tempDir, callback);
                },

                function (callback) {
                    Path.exists(templateFile, function (exists) {
                        if (exists) {
                            callback(null);
                        } else {
                            callback(true);
                        }
                    });
                }
            ],

            function (err, results) {
                expect(err).to.be.not.ok;

                rimraf(tempDir, function () {
                    done();
                });
            });
        });
    });
});
