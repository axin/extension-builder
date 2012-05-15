var connect = require('connect');
var fs = require('fs');
var Path = require('path');
var url = require('url');

connect()
    .use(connect.query())
    .use(connect.cookieParser('secret'))
    .use(connect.session({ cookie: { maxAge: 60000 }}))
    .use(function(req, res, next){
        var sess = req.session;

        if (sess.user) {
            var mime = getMimeType(req.originalUrl);

            res.setHeader('Content-Type', getMimeType(req.originalUrl));
            res.write(route(req.originalUrl));
            res.end();
        } else {
            var resource = getResuource(req.originalUrl);

            if (resource !== 'login.html' && getMimeType(req.originalUrl) === 'text/html') {
                res.setHeader('Content-Type', 'text/html');
                res.write('<script>window.location.replace(window.location.origin + "/login.html")</script>');
                res.end();
            } else {
                if (req.query.user) {
                    sess.user = req.query.user;

                    res.setHeader('Content-Type', 'text/html');
                    res.write('<script>window.location.replace(window.location.origin + "/extensions.html?user=' + sess.user + '")</script>');
                    res.end();
                } else {
                    res.setHeader('Content-Type', getMimeType(req.originalUrl));
                    res.write(route(req.originalUrl));
                    res.end();
                }
            }
        }
    }
).listen(3000);

function route(urlStr) {
    var urlStr = urlStr.replace(/\?.*$/, '');

    var file = Path.join(Path.resolve(__filename, '../../web-interface'), url.parse(urlStr).pathname);

    if (Path.existsSync(file)) {
        return fs.readFileSync(file, 'utf-8');
    } else {
        return '404';
    }
}

function getResuource(url) {
    return url.match(/\/([^\?]*)(\?|$)/)[1];
}

function getMimeType(url) {
    var match = url.match(/\.([^\.\?]+)($|\?)/);
    var ext;

    if (match) {
        ext = match[1];
    } else {
        ext = 'html';
    }

    var mime;

    switch (ext) {
        case 'js':
            mime = 'text/javascript';
            break;
        case 'css':
            mime = 'text/css';
            break;
        case 'html':
            mime = 'text/html';
            break;
    }

    return mime;
}