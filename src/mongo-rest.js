var http = require('http');
var mongo = require('mongodb');
var Server = mongo.Server;
var Db = mongo.Db;
var program = require('commander');
var uuid = require('node-uuid');

program
    .option('-h, --host [value]', 'Mongo host', 'localhost')
    .option('-p, --port [value]', 'Mongo port', '27017')
    .option('-t, --http [value]', 'Http server port', '8009')
    .option('-d, --database [value]', 'Database name', 'ExtensionBuilder')
    .parse(process.argv);

var server = new Server(program.host, parseInt(program.port));
var db = new Db(program.database, server);

http.createServer(function(request, response) {
    request.setEncoding('utf-8');

    var matchRegExp = /(.*)\/(.*)/;
    var matches = request.url.match(matchRegExp);

    var collectionName = null;
    var documentId = null;

    if (matches[1]) {
        collectionName = matches[1];
    }

    if (matches[2]) {
        documentId = matches[2];
    }

    var requestData = '';

    response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "http://localhost:3000"});

    request.on('data', function (chunk) {
        requestData += chunk;
    });

    request.on('end', function () {
        if (collectionName && documentId) {
            documentId = decodeURIComponent(documentId);

            switch (request.method) {
                case 'POST':
                    db.open(function(err, db) {
                        if(!err) {
                            db.collection(collectionName, function(err, collection) {
                                var doc = JSON.parse(requestData);

                                if (documentId === 'new') {
                                    doc['_id'] = uuid.v4();
                                } else {
                                    doc['_id'] = documentId;
                                }

                                collection.insert(doc, {safe:true}, function(err, result) {
                                    db.close();

                                    response.write(doc['_id']);
                                    response.end();
                                });
                            });
                        }
                    });
                    break;

                case 'GET':
                    db.open(function(err, db) {
                        if(!err) {
                            db.collection(collectionName, function(err, collection) {
                                var query = {};

                                if (documentId !== 'all') {
                                    query = {"_id": documentId};
                                }

                                if (/{.*}/.test(documentId)) {
                                    query = JSON.parse(documentId);
                                }

                                collection.find(query).toArray(function(err, items) {
                                    if (!err) {
                                        response.write(JSON.stringify(items));
                                    }

                                    response.end();
                                    db.close();
                                });
                            });
                        }
                    });
                    break;

                case 'DELETE':
                    db.open(function(err, db) {
                        if(!err) {
                            db.collection(collectionName, function(err, collection) {
                                collection.remove({"_id": documentId}, {safe:true}, function(err, result) {
                                    response.end();
                                    db.close();
                                });
                            });
                        }
                    });
                    break;
            }
        } else {
            response.end();
        }
    });

}).listen(parseInt(program.http));
