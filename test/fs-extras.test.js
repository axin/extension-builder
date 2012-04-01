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

    describe('copyDirectoryContents()', function () {
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

    describe('getListOfFiles()', function () {
        it('Should return list of files as array', function (done) {
            FsExtras.getListOfFiles(bhoTemplateDir, function (err, result) {
                expect(err).to.be.not.ok;
                expect(result).to.be.instanceof(Array);
                done();
            });
        });

        it('Should return error, if directory does not exist', function (done) {
            var nonexistentDir = Path.join(__filename, '../nonexistent-dir');

            FsExtras.getListOfFiles(nonexistentDir, function (err, result) {
                expect(err).to.be.ok;
                expect(result).to.be.not.ok;
                done();
            });
        });
    });
});
