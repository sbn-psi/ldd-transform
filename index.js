// node modules
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const readSync = require('read-file-relative').readSync;
const xml2js = require('xml2js');
const libxslt = require('libxslt');
const viz = require('viz.js');

// xml/js transformers
const parseXmlString = xml2js.parseString;
const xmlBuilder = new xml2js.Builder();

// express server setup
const app = express();
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('public'));
app.listen(3001);

// preload xml stylesheets
const htmlxslt = readSync('/IngestLddView.xsl');
const dotxslt = readSync('/IngestLddDot.xsl');

//////////////////ENDPOINTS////////////////////

/*----------------XML to JSON----------------*/

app.post('/xml/to/json', function (req, res) {
    let xml = req.body
    xmlToJson(xml, res);
});

app.post('/file/to/json', function(req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }
    let file = req.files.file.data.toString();
    xmlToJson(file, res);
})

function xmlToJson(xml, res) {
    parseXmlString(xml, function(err, result) {
        if (err && err.length > 0) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    })
}

/*----------------JSON to XML----------------*/

app.post('/json/to/xml', function (req, res) {
    let object = req.body
    let xml = xmlBuilder.buildObject(object);
    res.send(xml);
});

/*----------------XML to HTML----------------*/

app.post('/xml/to/html', function(req, res) {
    let xml = req.body;
    xmlToHtml(xml, res);
});

app.post('/file/to/html', function(req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }
    let file = req.files.file.data.toString();
    xmlToHtml(file, res);
})

function xmlToHtml(xml, res) {
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
}

/*----------------XML to Graph----------------*/

app.post('/xml/to/graph', function(req, res) {
    let xml = req.body;
    xmlToGraph(xml, res);
});

app.post('/file/to/graph', function(req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }
    let file = req.files.file.data.toString();
    xmlToGraph(file, res);
})

function xmlToGraph(xml, res) {
    libxslt.parse(dotxslt, function(err, stylesheet) {
        if (err && err.length > 0) {
            res.writeHead(500);
            res.send(err);
        } else {   
            stylesheet.apply(xml, function(err, result) {
                if (err && err.length > 0) {
                    res.writeHead(500);
                    res.send(err);
                } else {
                    res.send(viz(result));
                }
            })
        }
    });
}