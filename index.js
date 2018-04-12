// node modules
const express = require('express');
const bodyParser = require('body-parser');
const readSync = require('read-file-relative').readSync;
const xml2js = require('xml2js');
const libxslt = require('libxslt');

// xml/js transformers
const parseXmlString = xml2js.parseString;
const xmlBuilder = new xml2js.Builder();

// express server setup
const app = express();
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.listen(3001);

// preload xml stylesheets
const htmlxslt = readSync('/IngestLddView.xsl');

app.post('/xml/to/json', function (req, res) {
    let xml = req.body

    parseXmlString(xml, function(err, result) {
        if (err && err.length > 0) {
            res.writeHead(500);
            res.send(err);
        } else {
            res.json(result);
        }
    })
});

app.post('/json/to/xml', function (req, res) {
    let object = req.body
    let xml = xmlBuilder.buildObject(object);
    res.send(xml);
});

app.post('/xml/to/html', function(req, res) {
    let xml = req.body;
    
    libxslt.parse(htmlxslt, function(err, stylesheet) {
        if (err && err.length > 0) {
            res.writeHead(500);
            res.send(err);
        } else {   
            stylesheet.apply(xml, function(err, result) {
                if (err && err.length > 0) {
                    res.writeHead(500);
                    res.send(err);
                } else {
                    res.send(result);
                }
            })
        }
    });
});