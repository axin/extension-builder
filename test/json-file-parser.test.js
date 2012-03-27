var Chai = require('chai');
var Jack = require('jack');
var Path = require('path');
var JsonFileParser = require('../src/json-file-parser');

Chai.use(Jack.chai);
var expect = Chai.expect;

describe('JsonFileParser', function () {
    describe('.parseJsonFile()', function () {
        it('Should be defined', function () {
            expect(JsonFileParser.parseJsonFile).to.be.ok;
        });

        it('Should open existing files', function (done) {
            var pathToJsonFile = Path.resolve(__filename, '../test-files/valid-json-file.json');
            JsonFileParser.parseJsonFile(pathToJsonFile, function (err, result) {
                expect(err).to.be.not.ok;
                expect(result).to.be.ok;
                done();
            });
        });
    });
});
