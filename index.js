// node modules
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const readSync = require('read-file-relative').readSync;
const xml2js = require('xml2js');
const libxslt = require('libxslt');
const viz = require('viz.js');
const async = require('async');
const cheerio = require('cheerio');

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

console.clear();

//////////////////ENDPOINTS////////////////////

// reports an error if present. returns whether or not an error was sent
function reportError(err, res, callback) {
    if (err) {
        let errorMessage = err;
        if( err instanceof Error) {
            errorMessage = err.message;
        }
        if(res && errorMessage && errorMessage.length > 0) {
            res.status(500).send(errorMessage);
            return true;
        }
        if (callback) {
            callback(err);
        }
    }
    return false;
}

// this function assumes there is only one file in the request, and returns its contents
function extractFile(req) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }
    for(const key in req.files) {
        return req.files[key].data.toString();
    }
}

/*----------------XML to JSON----------------*/

app.post('/xml/to/json', function (req, res) {
    let xml = req.body
    xmlToJson(xml, res);
});

app.post('/file/to/json', function(req, res) {
    const file = extractFile(req);
    xmlToJson(file, res);
})

function xmlToJson(xml, res) {
    parseXmlString(xml, function(err, result) {
        reportError(err, res) || res.json(result);
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
    const file = extractFile(req);
    xmlToHtml(file, res);
})

function xmlToHtml(xml, res, callback) {
    libxslt.parse(htmlxslt, function(err, stylesheet) {
        if (!reportError(err, res, callback)) {
            stylesheet.apply(xml, function(err, result) {
                if (!reportError(err, res, callback)) {
                    if (res) res.send(result);
                    if (callback) callback(null, result);
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
    const file = extractFile(req);
    xmlToGraph(file, res);
})

function xmlToGraph(xml, res, callback) {
    libxslt.parse(dotxslt, function(err, stylesheet) {
        if (!reportError(err, res, callback)) {
            stylesheet.apply(xml, function(err, result) {
                if (!reportError(err, res, callback)) {
                    try { 
                        let svg = viz(result);
                        if( res ) res.send(svg);
                        if( callback ) callback(null, svg);
                    } catch (vizErr) {
                        reportError("Error visualizing graph", res);
                    }
                }
            })
        }
    });
}

/*----------------XML to Doc----------------*/

app.post('/xml/to/doc', function(req, res) {
    let xml = req.body;
    buildDoc(xml, res);
});

app.post('/file/to/doc', function(req, res) {
    const file = extractFile(req);
    buildDoc(file, res);
})

function buildDoc(xml, res) {
    async.parallel(
        [
            function(callback) { xmlToHtml(xml, null, callback) },
            function(callback) { xmlToGraph(xml, null, callback) }
        ],
        function(err, results) {
            reportError(err, res) || compile(results[0], results[1]);
        }
    )

    function compile(html, graph) {
        let $h = cheerio.load(html);
        let $g = cheerio.load(graph, { xmlMode: true });
        $g('svg').css('max-width', '100%').css('height', 'auto');
        $h('h1').first().after($g.xml('svg'));
        $h('title').text($h('h1').first().text());
        res.send($h.html());
    }
}
