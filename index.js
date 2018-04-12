const express = require('express');
const bodyParser = require('body-parser');
const readSync = require('read-file-relative').readSync;
const xml2js = require('xml2js');
const gulp = require('gulp');
const xslt = require('gulp-xslt');
const through = require('through');
// const async = require('async');

const parseString = xml2js.parseString;
const builder = new xml2js.Builder();

const app = express();
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.json());

app.get('/particles', function(req, res) {
    
    let data = readSync('/ldd-particle.xml');

    parseString(data, function(err, result) {
        if (err && err.length > 0) {
            res.writeHead(500);
            res.send(err);
        } else {
            res.json(result);
        }
    })
});

app.get('/imaging', function(req, res) {
    
    let data = readSync('/PDS4_IMG_IngestLDD_1900.xml');

    parseString(data, function(err, result) {
        if (err && err.length > 0) {
            res.writeHead(500);
            res.send(err);
        } else {
            res.json(result);
        }
    })
});

app.post('/xmltojson', function (req, res) {
    let xml = req.body

    parseString(xml, function(err, result) {
        if (err && err.length > 0) {
            res.writeHead(500);
            res.send(err);
        } else {
            res.json(result);
        }
    })
});

app.post('/jsontoxml', function (req, res) {
    let object = req.body

    let xml = builder.buildObject(object);
    res.send(xml);
});

function sendTo(res) {
    return through(
        function write(data) {
            res.write(data.contents);
        },
        function end() {
            res.end();
        }
    )
}

app.get('/particles-html', function(req, res) {

    gulp.src('./ldd-particle.xml')
        .pipe(xslt('./IngestLddView.xsl'))
        .pipe(sendTo(res));
});

app.get('/particles-dot', function(req, res) {

    gulp.src('./ldd-particle.xml')
        .pipe(xslt('./IngestLddDot.xsl'))
        .pipe(sendTo(res));
});

// serve anything in the public directory directly
app.use(express.static('public'));

app.listen(3001);