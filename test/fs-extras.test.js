var Chai = require('chai');
var Jack = require('jack');
var Path = require('path');
var Async = require('async');
var rimraf = require('rimraf');
var FsExtras = require('../src/fs-extras');

Chai.use(Jack.chai);
var expect = Chai.expect;

describe('FsExtras', function () {
    var bhoTemplateDir = Path.resolve(__filename, '../../templates/bho');

    describe('.copyDirectoryContents()', function () {
        it('Should copy directory contents', function (done) {
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

    describe('.getListOfChilditems()', function () {
        it('Should return list of files and subdirectories in given directory as array', function (done) {
            FsExtras.getListOfChilditems(bhoTemplateDir, function (err, result) {
                expect(err).to.be.not.ok;
                expect(result).to.be.instanceof(Array);
                done();
            });
        });

        it('Should return error if given directory does not exist', function (done) {
            var nonexistentDir = Path.join(__filename, '../nonexistent-dir');

            FsExtras.getListOfChilditems(nonexistentDir, function (err, result) {
                expect(err).to.be.ok;
                expect(result).to.be.not.ok;
                done();
            });
        });
    });

    describe('.makeSubstitutionsInChilditemNames()', function () {
        it('Should replace {{{extensionName}}} with "SampleExtension" in file and directory names', function (done) {
            var testFilesDirectory = Path.join(__filename, '../test-files');

            Async.waterfall([
                function (callback) {
                    FsExtras.getListOfChilditems(testFilesDirectory, callback);
                },

                function (items, callback) {
                    FsExtras.makeSubstitutionsInChilditemNames('{{{extensionName}}}', 'SampleExtension',
                        items, callback);
                }
            ],

            function (err, result) {
                expect(err).to.be.not.ok;

                Async.waterfall([
                    function (callback) {
                        FsExtras.getListOfChilditems(testFilesDirectory, callback);
                    },

                    function (items, callback) {
                        FsExtras.makeSubstitutionsInChilditemNames('SampleExtension', '{{{extensionName}}}',
                            items, callback);
                    }
                ],

                function (err, result) {
                    done();
                });
            });
        });
    });
});
