var id,
    data,
    svg,
    ldd = 'root',
    toolbarWidth = '400',
    width = $(document).width() - toolbarWidth,
    height = $(document).height(),
    activeNode = null,
    tDuration = 1000, // transition duration (ms)
    // click event variables
    delay = 500, // double click delay (ms)
    clicks = 0,
    timer = null,
    // Edges (Lines)
    linkHighlightStroke = 'orange',
    linkHighlightStrokeWidth = '5px',
    linkStroke = 'black',
    linkStrokeWidth = '1px',
    linkMode = false,
    // Nodes
    rx = 70, // x radius of ellipse
    ry = 20, // y radius of ellipse
    verticalOffset = 50,
    verticalPadding = 5,
    verticalSpacing = ry * 2 + verticalPadding,
    rootNodeFill = 'lightgreen',
    classNodeFill = 'lightblue',
    attributeNodeFill = 'white',
    nodeStroke = 'black',
    nodeStrokeWidth = '1px',
    nodeHighlightStroke = 'orange',
    nodeHighlightStrokeWidth = '3px',
    activeNodes = [],
    nodeGen = [],
    nodes = null,
    links = null,
    rootNodes = [],
    optional = 0.25,    // link opacity
    required = 1,       // link opacity
    lidType = null,
    zoomScale = [0.1, 10],
    tree = d3.tree()
        .size([height, width]),
    zoomBounds = [
        [-20 * width, -10 * height],
        [10 * width, 40 * height]
    ]; // [[-x,y],[x,-y]]

const colWidth = 225;
const xOffset = 100;

initGrid();

loadFile();

function loadFile() {
    if (window.localStorage.getItem('ld3')) {
        main(window.localStorage.getItem('ld3'));
    } else {
        main(JSON.stringify(_root));
    }
};

function main(json) {
    data = new Data(json);

    // remove old tree
    d3.select('.tree').remove();

    svg = d3.select('.main')
        .append('g')
        .attr('class', 'tree');

    update();
    
    updateToolbar(null);
};

function update() {
    var tIn = d3.transition()
        .duration(1000);

    var tOut = d3.transition()
        .duration(1000);

    var link = svg.selectAll('.link')
        .data(data.links,function(l,idx) {
            return l.id;
        })
        .datum(function(l,i,nodes) {
            // update link values to reflect new data indices
            let st = l.id.split(':');
            let s = data.getNode(st[0],true);
            let t = data.getNode(st[1],true);
            
            l.source = s;
            l.target = t;
            
            return l;
        });

    var node = svg.selectAll('g')
        .data(data.nodes,function(d,idx) {
            // this is update because:
            // on enter(), these nodes don't actually exist yet
            let lidId;
            
            try {
                lidId = d['local_identifier'][0];
            } catch (err) {
                lidId = d['identifier_reference'][0];
            }
            
            // configure horiontal (x) position

            if (d.rootNode) d.x = colWidth - xOffset;
            else d.x = d.col * colWidth - xOffset;

            // configure vertical (y) position
            d.y = verticalOffset + idx * verticalSpacing;
            
            d.lid = lidId;

            return d.lid;
        });
    
    var title = svg.selectAll('.node-title')
        .text(function(d) {
            return d.name[0];
        });

    var linkEnter = link
        .enter().append('path')
        .attr('class', 'link')
        .style('opacity',1e-6);
    
    linkEnter.transition(tIn)
        .delay(100)
        .style('opacity', linkOpacity);

    var nodeEnter = node
        .enter().append('g')
        .classed('node', true)
        .on('click', toggleNodes)
        .attr('id', function(d) {
            let _id;

            try {
                _id = d['local_identifier'][0].replace('.', '-');
            } catch (err) {
                _id = d['identifier_reference'][0].replace('.', '-');
            }

            return _id;
        })
        .style('opacity',1e-6)
        .attr('transform', function(d,idx) {
            return `translate(${d.x,d.y})`;
        });
    
    nodeEnter.transition(tIn)
        .style('opacity',1)
    
    // configure behavior when nodes enter
    // append ellipse to each node group
    nodeEnter
        .append('ellipse')
        .attr('class', 'circle')
        .style('stroke', nodeStroke)
        .style('fill', highlightNode)
        .attr('rx',1e-6)
        .attr('ry',1e-6)
        .transition(tIn)
        .attr('rx', rx)
        .attr('ry', ry)
        
    // append text to each node group
    nodeEnter
        .append('text')
        .attr('class','node-title')
        .text(function(d) {
            return d.name[0];
        })
        .style('font-size', function(d) {
            let maths = Math.min(2 * ry, (2 * ry) / this.getComputedTextLength() * 40);
            return `${maths}px`;
        })
        .attr('dx', () => rx * -.8)
        .attr('dy', () => ry / 4)
        .style('opacity',1e-6)
        .transition(tIn)
        .delay(750)
        .style('opacity',1);
    nodeEnter
        .attr('transform', function(d, idx) {
            // configure horiontal (x) position

            if (d.rootNode) d.x = colWidth - xOffset;
            else d.x = d.col * colWidth - xOffset;

            // configure vertical (y) position
            d.y = verticalOffset + idx * verticalSpacing;
            return `translate(${d.x},${d.y})`;
        });

    // configure behavior when links enter
    linkEnter
        .attr('d', d3.linkHorizontal()
            .x(function(d) {
                return getNodeByIdx(d).x;
            })
            .y(function(d) {
                return getNodeByIdx(d).y;
            })
        )
        .attr('fill', 'none')
        .attr('stroke', linkStroke)
        .attr('stroke-width', linkStrokeWidth);
    
    // // // REMOVE // // //
    var nodeExit = node.exit()
        .transition(tOut)
        .style('opacity',1e-6)
        .remove();
    
    var linkExit = link.exit()
        .transition(tOut)
        .style('opacity',1e-6)
        .remove();
    
    // TODO transition on update here:
    node
        .transition()
        .duration(750)
        .delay(1000)
        .attr('transform',function(d) {
            return `translate(${d.x},${d.y})`;
        });
    
    link
        .transition()
        .duration(750)
        .delay(1000)
        .attr('d', d3.linkHorizontal()
            .x(function(l,idx) {
                return getNodeByIdx(l).x;
            })
            .y(function(l,idx) {        
                return getNodeByIdx(l).y;
            })
        );
};

function initGrid() {
    var sim = d3.select('svg')
        .attr('width', width)
        .attr('height', height);

    var zoom = d3.zoom()
        .scaleExtent(zoomScale)
        .translateExtent(zoomBounds)
        .on('zoom', zoomed);

    var x = d3.scaleLinear()
        .domain([-1, width + 1])
        .range([-1, width + 1]);

    var y = d3.scaleLinear()
        .domain([-1, height + 1])
        .range([-1, height + 1]);

    var xAxis = d3.axisBottom(x)
        .ticks((width + 2) / (height + 2) * 10)
        .tickSize(height)
        .tickPadding(8 - height);

    var yAxis = d3.axisRight(y)
        .ticks(10)
        .tickSize(width)
        .tickPadding(8 - width);

    var gX = sim.append('g')
        .attr('class', 'axis axis--x')
        .call(xAxis);

    var gY = sim.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis);

    sim.call(zoom)
        .on('dblclick.zoom', null);

    function zoomed() {
        gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
        svg.attr('transform', d3.event.transform);
    };
};

var g1,
    g2,
    g3;
function toggleNodes(node) {
    if (linkMode) return data.createLink(node);
    
    activeNodes = [];

    if (activeNode == node) {
        updateToolbar(null);
        activeNode = null;
        nodeGen = [];
    } else if (!node) {
        g2 = nextGen(g1);
        g3 = nextGen(g2);
        nodeGen = g1.concat(g2);
        activeNodes = activeNodes
            .concat(g1)
            .concat(g2)
            .concat(g3);
        updateToolbar();
    } else {
        g1 = [node];
        g2 = nextGen(g1);
        g3 = nextGen(g2);
        nodeGen = g1.concat(g2);
        var nodeIdx = data.getNode(node.lid,true);
        activeNode = data.nodes[nodeIdx];
        activeNode.parents = data.getParents(nodeIdx);
        activeNodes = activeNodes
            .concat(g1)
            .concat(g2)
            .concat(g3);
        updateToolbar();
    }

    svg.selectAll('.link')
        .style('stroke', function(link) {
            let _lid,
                _active = null;
            
            try {
                _lid = getNodeByIdx(link.source)['local_identifier'][0];
            } catch (err) {
                _lid = getNodeByIdx(link.source)['identifier_reference'][0];
            }
            
            _active = nodeGen.find(d => {
                try {
                    return d['local_identifier'][0] == _lid;
                } catch (err) {
                    return d['identifier_reference'][0] == _lid;
                }
            })
            
            if (_active) {
                return linkHighlightStroke;
            } else if (!activeNode || !activeNode.parents) {
                return linkStroke;
            } else {
                return activeNode.parents.find(d => {
                    if (data.getNode(d.lid,true) == link.source
                    && data.getNode(activeNode.lid,true) == link.target) {
                        return d;
                    } else {
                        return false;
                    }
                }) ? 'red' : linkStroke;
            }
        })
        .style('stroke-width', function(link) {
            let _lid,
                _active = null;
            
            try {
                _lid = getNodeByIdx(link.source)['local_identifier'][0];
            } catch (err) {
                _lid = getNodeByIdx(link.source)['identifier_reference'][0];
            }
            
            _active = nodeGen.find(d => {
                try {
                    return d['local_identifier'][0] == _lid;
                } catch (err) {
                    return d['identifier_reference'][0] == _lid;
                }
            })
            
            if (_active) {
                return linkHighlightStrokeWidth;
            } else if (!activeNode || !activeNode.parents) {
                return linkStrokeWidth;
            } else {
                return activeNode.parents.find(d => {
                    if (data.getNode(d.lid,true) == link.source
                            && data.getNode(activeNode.lid,true) == link.target) {
                        return d;
                    } else {
                        return false;
                    }
                }) ? linkHighlightStrokeWidth : linkStrokeWidth;
            }
        })
        .style('opacity', linkOpacity);

    svg.selectAll('.circle')
        .style('stroke', function(d) {
            let _lid,
                _active = null;

            try {
                _lid = d['local_identifier'][0];
            } catch (err) {
                _lid = d['identifier_reference'][0];
            }

            _active = activeNodes.find(e => {
                try {
                    return e['local_identifier'][0] == _lid;
                } catch (err) {
                    return e['identifier_reference'][0] == _lid;
                }
            });
            
            if (_active) {
                return nodeHighlightStroke;
            } else if (!activeNode || !activeNode.parents) {
                return nodeStroke;
            } else {
                return activeNode.parents.find(e => {
                    try {
                        return e['local_identifier'][0] == _lid;
                    } catch (err) {
                        return e['identifier_reference'][0] == _lid;
                    }
                }) ? 'red' : nodeStroke;
            }
            
        })
        .style('stroke-width', function(d) {
            let _lid,
                _active = null;

            try {
                _lid = d['local_identifier'][0];
            } catch (err) {
                _lid = d['identifier_reference'][0];
            }

            _active = activeNodes.find(e => {
                try {
                    return e['local_identifier'][0] == _lid;
                } catch (err) {
                    return e['identifier_reference'][0] == _lid;
                }
            });
            
            if (_active) {
                return nodeHighlightStrokeWidth;
            } else if (!activeNode || !activeNode.parents) {
                return nodeStrokeWidth;
            } else {
                return activeNode.parents.find(e => {
                    try {
                        return e['local_identifier'][0] == _lid;
                    } catch (err) {
                        return e['identifier_reference'][0] == _lid;
                    }
                }) ? nodeHighlightStrokeWidth : nodeStrokeWidth;
            }
            
        })
};

function linkOpacity(l) {
    var isRequired;
    
    var parentIdx = l.source;
    var parentNode = data.nodes[parentIdx];
    var childIdx = l.target;
    var childNode = data.nodes[childIdx];
    
    var parent = data.model['Ingest_LDD']['DD_Class'].find(c => {
        if (c.lid == parentNode.lid) {
            return c;
        } else {
            return false;
        }
    });
    
    parent['DD_Association'].map(a => {
        
        if (a.lid == childNode.lid) {
            if (!childNode.minimum_occurrences) isRequired = true;
            else if (childNode.minimum_occurrences[0] > 0) isRequired = true;
            else isRequired = false;
        }
        
    });
    
    return isRequired ? required : optional;
};

function highlightNode(n) {
    let _color,
        _lid;

    try {
        _lid = n['local_identifier'][0];
    } catch (err) {
        _lid = n['identifier_reference'][0];
    }

    if (n.rootNode) _color = rootNodeFill;
    else if (n.className == 'class') _color = classNodeFill;
    else _color = attributeNodeFill;

    return _color;
};

function nextGen(parent) {
    let _nextGen = [];

    data.links.map(link => {
        let source = getNodeByIdx(link.source);
        let target = getNodeByIdx(link.target);

        if (parent && parent.indexOf(source) != -1 && _nextGen.indexOf(target) == -1) {
            _nextGen.push(target);
        }
    });

    return _nextGen;
};

function getNodeByIdx(nodeIdx) {
    return data.nodes[nodeIdx];
};

function updateToolbar(flag) {
    if (flag === null) defaultToolbar(addListeners);
    else if (linkMode) linkModeToolbar(addListeners);
    else nodeToolbar(addListeners);
    
    function defaultToolbar(cb) {
        resetToolbar();
        
        $('#tools').load('./partials/tools.default.html',null,function(toolsHTML) {
            $("#tools").replaceWith(toolsHTML);
            
            $('#toolbar-content').load('partials/toolbar.default.html', function(toolbarHtml) {
                
                $('#name-toolbar').text(data.model['Ingest_LDD']['name'][0]);
                $('#ldd_version_id-toolbar').text(data.model['Ingest_LDD']['ldd_version_id'][0]);
                $('#full_name-toolbar').text(data.model['Ingest_LDD']['full_name'][0]);
                $('#steward_id-toolbar').text(data.model['Ingest_LDD']['steward_id'][0]);
                $('#namespace_id-toolbar').text(data.model['Ingest_LDD']['namespace_id'][0]);
                $('#comment-toolbar').text(data.model['Ingest_LDD']['comment'][0]);
                $('#pds4_im_version-toolbar').text(data.pds4IMVersion);
                
                cb();
            });
        });
    };
    
    function nodeToolbar(cb) {
        resetToolbar();
        
        function tryReturn(val) {
            try {
                return val;
            } catch (err) {
                console.error(err)
                return '';
            }
        };
        
        $.get("partials/tools.node.html", function(data) {
            $("#tools").replaceWith(data);
            
            var node = activeNode;
            // update toolbar - node details
            $('#active-node-details').load('./partials/node.details.html', function() {
                $('#active-node-title').text(node.lid);
                
                $('#active-node-title').prepend('<i class="fas fa-pencil-alt" id="editnode" title="Edit Element"></i>');
                
                $('#name-node').text(node.name[0]);
                $('#identifier_reference-node').text(function() {
                    try {
                        return node.identifier_reference[0];
                    } catch (err) {
                        return node.local_identifier[0];
                    }
                });
                $('#version_id-node').text(function() {
                    if (!node.version_id) return '';
                    else return node.version_id[0];
                });
                $('#definition-node').text(function() {
                    if (!node.definition) return '';
                    else return node.definition[0];
                });
                $('#submitter_name-node').text(function() {
                    if (!node.submitter_name) return '';
                    else return node.submitter_name[0];
                });
                
                // update toolbar - node children
                if (node.children) {
                    $('#active-children-title').text(`Children (${node.children.length})`);
                    $('#active-node-children').empty();
                    node.children.map(a => {
                        $('#active-node-children').append(newActiveChild(a));
                    });
                } else {
                    $('#active-children-title').text(`Children (0)`);
                }
                
                // update toolbar - node parents
                if (node.parents) {    
                    $('#active-parents-title').text(`Parents (${node.parents.length})`);
                    $('#active-node-parents').empty();
                    node.parents.map(p => {
                        $('#active-node-parents').append(newActiveChild(p));
                    });
                } else {
                    $('#active-parents-title').text(`Parents (0)`);
                }
                
                cb();
            });
        });
    };
    
    function linkModeToolbar(cb) {
        $.get("partials/tools.link-mode.html", function(data) {
            $("#tools").replaceWith(data);
            cb();
        });
    };
    
    function resetToolbar() {
        $('#active-node-title').empty();
        $('#active-node-details').empty();
        $('#active-children-title').empty();
        $('#active-parents-title').empty();
        $('#active-node-children').empty();
        $('#active-node-parents').empty();
        $('#create-node').remove();
    };
};

// TODO create partial, fill in values with jQuery
function newActiveChild(node) {
    let childLid,
        htmlChildLid;
    
    let keys = ['minimum_occurrences','maximum_occurrences'];
    
    try {
        childLid = node['local_identifier'][0];
        keys.unshift('local_identifier');
    } catch (err) {
        childLid = node['identifier_reference'][0];
        keys.unshift('identifier_reference');
    }
    
    htmlChildLid = childLid.replace('.','-');
    
    let childTitle = `<h3 class="title active-child-clickable clickable">${childLid}</h3>`;
    
    let minOcc = node['minimum_occurrences'];
    let maxOcc = node['maximum_occurrences'];
    
    let values = '';
    values += `<h4 class="key">${keys[0]}</h4>`;
    values += `<h4 class="value">${childLid}</h4>`;
    
    if (minOcc && maxOcc) {
        values += `<h4 class="key">${keys[1]}</h4>`;
        values += `<h4 class="value">${minOcc}</h4>`;
        
        values += `<h4 class="key">${keys[2]}</h4>`;
        values += `<h4 class="value">${maxOcc}</h4>`;
    }
    
    let childButtons = `<div class="active-child-buttons ${htmlChildLid}"><i class="fas fa-lg fa-trash-alt"></i></div>`;
    
    return `<form name="${childLid}-form" class="active-child">${childTitle}${values}${childButtons}</form>`;
};

function addListeners() {
    $('#cancel').unbind().on('click', closeModal);

    $('#next').unbind().on('click', next);

    $('#save').unbind().on('click', saveNode);
    
    $('#create-node').unbind().on('click', data.createNode);
    
    $('#create-link').unbind().on('click', data.linkMode);
    
    $('#startover').unbind().on('click', function() {
        let _confirm = confirm('Are you sure you want to start over? All of your changes will be lost.');
        
        if (_confirm) return startOver();
        else return;
        
        function startOver() {
            localStorage.removeItem('ld3');
            loadFile();
        };
    });
    
    $('#editldd').unbind().on('click', function() {
        newModal('ldd');
    });
    
    $('.decline').unbind().on('click', function() {
        closeModal();
    });
    
    $('#show-and-hide').hide();
    $('#toggle-ldd').unbind().on('click', function() {
        const current = $(this).text();
        
        // show or hide
        if (current == 'Show') {
            $("#show-and-hide").fadeIn();
            $(this).text('Hide');
        } else if (current == 'Hide') {
            $('#show-and-hide').fadeOut();
            $(this).text('Show');
        } else {
            throw new Error('unexpected text');
        }
    });
    
    $('#edit-ldd-save').unbind().on('click', function() {
        var values = {};
        
        $.each($('#editlddform').serializeArray(), function(i, field) {
            values[field.name] = field.value;
        });
        
        data.modifyLddDetails(values);
        
        updateToolbar(null);
        
        closeModal();
    });
    
    $('#editnode').unbind().on('click', function() {
        newModal('editnode');
    });
    
    $('#editnode-save').unbind().on('click', function() {
        var values = {
            'name': $('#name-editnode').val(),
            'local_identifier': $('#identifier_reference-editnode').val(),
            'version_id': $('#version_id-editnode').val(),
            'definition': $('#definition-editnode').val(),
            'submitter_name': $('#submitter_name-editnode').val()
        };
        
        if (activeNode.className == 'attribute') {
            // do attribute stuff to values
            values['value_domain'] = {
                'DD_Permissible_Value': [],
                'enumeration_flag': [$('input[name="enumeration_flag"]:checked').val()],
                'unit_of_measure_type': [$('#unit_of_measure_type-editnode').val()],
                'value_data_type': [$('#value_data_type-editnode').val()]
            };
            var dataType = $('#value_data_type-editnode').val();
            
            if (dataType == 'ASCII_Integer') {
                // if (min) add min to value_domain
                var min = $('#minimum_value').val();
                if (min) {
                    values['value_domain']['minimum_value'] = [min];
                }
                
                // if (max) add max to value_domain
                var max = $('#maximum_value').val();
                if (max) {
                    values['value_domain']['maximum_value'] = [max];
                }
            } else if (dataType == 'ASCII_Short_String_Collapsed') {
                values['value_domain'] = {
                    'enumeration_flag': [$('input[name="enumeration_flag"]:checked').val()],
                    'unit_of_measure_type': [$('#unit_of_measure_type-editnode').val()],
                    'value_data_type': []
                };
            } else if (dataType == 'ASCII_Short_String_Collapsed' && $('input[name="enumeration_flag"]:checked').val() == true) {
                values['value_domain']['DD_Permissible_Value'] = [];
                $.each($('input[name="value"]'), function(index, value) {
                    values['value_domain']['DD_Permissible_Value'][index] = {
                        value: [$(value).val()],
                        value_meaning: null
                    };
                });
                $.each($('textarea[name="value_meaning"]'), function(index, value_meaning) {
                    values['value_domain']['DD_Permissible_Value'][index]['value_meaning'] = [$(value_meaning).val()];
                });
                values['value_domain']['DD_Permissible_Value'] = values['value_domain']['DD_Permissible_Value'].filter(v => {
                    if (!v.value[0] && !v.value_meaning[0]) return false;
                    else return true;
                });
            } else {
                console.error('unexpected data type');
            }
        };
        
        data.modifyNode(activeNode.lid, values);
        
        updateToolbar();
        
        closeModal();
    });
    
    $('.active-child-clickable').unbind().on('click', function(event) {
        var lid = $(event.target).text();
        var nodeIdx = data.getNode(lid,true);
        
        update();
        
        toggleNodes(data.nodes[nodeIdx]);
        
        updateToolbar();
    });
    
    // add event listeners to trash icons now that they exist in DOM
    $('.fa-trash-alt').unbind().on('click',function(event) {
        let target = event.target;
        let _confirm = confirm('Are you sure you want to delete this node?');

        if (_confirm) {
            let deleteLid = $(target).parent().attr('class').split(' ')[1].trim().replace('-','.');
            data.deleteNode(deleteLid);
            toggleNodes();
        } else {
            return;
        }
    });

    $('#download').unbind().on('click',function() {
        var currentModel = data.pureModel();
        var dateTime = currentModel['Ingest_LDD']['last_modification_date_time'][0];
        
        $.ajax({
            type: 'POST',
            url: '../json/to/xml',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(currentModel),
            success: function(res) {
                var blob = new Blob([res], {type: "text/xml;charset=utf-8"});
                saveAs(blob,`ldd.out.${dateTime}.xml`);
                data.defineNodesAndLinks();
            }
        });
    });
};

$(document).ready(function() {
    addListeners();
});