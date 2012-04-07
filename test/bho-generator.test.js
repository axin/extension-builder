var Chai = require('chai');
var Jack = require('jack');
var Path = require('path');
var rimraf = require('rimraf');
var BhoGenerator = require('../src/bho-generator');

Chai.use(Jack.chai);
var expect = Chai.expect;

describe('BhoGenerator', function () {
    describe('.generateBhoSource()', function () {
        it('Should generate BHO source code', function (done) {
            var tempDir = Path.join(__filename, '../temp2');

            BhoGenerator.generateBhoSource({ 'extension-name': 'Test' }, tempDir, { extensionName: 'Test' }, function () {
                rimraf(tempDir, function () {
                    done();
                });
            });
        });
    });
});
