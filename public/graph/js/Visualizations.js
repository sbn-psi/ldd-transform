app.factory('Visualizations', function(DataModel, $rootScope) {
    const dataModel = DataModel;

    // Nodes
    const rx = 70;                                          // x radius of ellipse
    const ry = 20;                                          // y radius of ellipse
    const colWidth = 225; // px
    const xOffset = 100; // px
    const verticalOffset = 50;                              // px
    const verticalPadding = 5;                              // px
    const verticalSpacing = ry * 2 + verticalPadding;       // px
    const nodeStroke = 'black';
    const rootNodeFill = 'lightgreen';
    const classNodeFill = '#ADD8E6';
    const attributeNodeFill = 'white';
    const activeNodeStroke = '#666666';
    const nodeStrokeWidth = '1px';
    const nodeHighlightStroke = 'orange';
    const nodeHighlightStrokeWidth = '3px';

    // Edges (Lines)
    const linkHighlightStroke = 'orange';
    const linkHighlightStrokeWidth = '5px';
    const linkStroke = 'black';
    const linkStrokeWidth = '1px';
    const optional = 0.25;                                  // link opacity
    const required = 1;                                     // link opacity

    const toolbarWidth = '400'; // px
    const width = $(document).width() - toolbarWidth;
    const height = $(document).height();
    const zoomScale = [0.1, 10];
    const zoomBounds = [
        [-20 * width, -10 * height],
        [10 * width, 40 * height]
    ]; // [[-x,y],[x,-y]]\

    let svg = null;
    let activeNodes = [];
    let g1 = [];
    let g2 = [];

    const nextGen = function(parent) {
        let _nextGen = [];

        dataModel.links.map(link => {
            let source = dataModel.nodes[link.source];
            let target = dataModel.nodes[link.target];

            if (parent && parent.indexOf(source) != -1 && _nextGen.indexOf(target) == -1) {
                _nextGen.push(target);
            }
        });

        return _nextGen;
    };

    return {
        svg: svg,

        linkMode: false,

        initGrid: function() {
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
                sim.selectAll('.tick text').remove();
                gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
                gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
                svg.attr('transform', d3.event.transform);
            };

            sim.selectAll('.tick text').remove();

            svg = d3.select('.main')
                .append('g')
                .attr('class','tree');

            this.update();
        },
        update: function() {
            const that = this;

            const tIn = d3.transition()
                .duration(1000);

            const tOut = d3.transition()
                .duration(1000);

            const link = svg.selectAll('.link')
                .data(dataModel.links,function(l,idx) {
                    return l.id;
                })
                .datum(function(l,i,nodes) {
                    // update link values to reflect new data indices
                    let st = l.id.split(':');
                    let s = dataModel.getNode(st[0],true);
                    let t = dataModel.getNode(st[1],true);

                    l.source = s;
                    l.target = t;

                    return l;
                });

            const node = svg.selectAll('g')
                .data(dataModel.nodes,function(d,idx) {
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

            // TODO transition on update here:
            link
                .transition()
                .duration(750)
                .delay(1000)
                .attr('d', d3.linkHorizontal()
                    .x(function(l,idx) {
                        return dataModel.nodes[l].x;
                    })
                    .y(function(l,idx) {
                        return dataModel.nodes[l].y;
                    })
                );

            node
                .transition()
                .duration(750)
                .delay(1000)
                .each(d => {
                    return d;
                })
                .attr('transform',function(d) {
                    return `translate(${d.x},${d.y})`;
                });

            const title = svg.selectAll('.node-title')
                .text(function(d) {
                    return d.name[0];
                });

            const linkEnter = link
                .enter()
                .append('path')
                .attr('class', 'link')
                .style('opacity',1e-6)
                .attr('d', d3.linkHorizontal()
                    .x(function(d) {
                        return dataModel.nodes[d].x;
                    })
                    .y(function(d) {
                        return dataModel.nodes[d].y;
                    })
                )
                .attr('fill', 'none')
                .attr('stroke', linkStroke)
                .attr('stroke-width', linkStrokeWidth)
                .transition(tIn)
                    .delay(100)
                    .style('opacity', this.linkOpacity);

            const nodeEnter = node
                .enter()
                .append('g')
                .classed('node', true)
                .on('click', function(target) {
                    if (that.linkMode) {
                        const linkCreated = dataModel.createLink(target);
                        if (linkCreated) {
                            that.linkMode = false;
                            dataModel.defineNodesAndLinks();
                            that.update();
                            that.toggleHighlights();
                        }
                    } else {
                        dataModel.setActiveNode(target);
                    }
                })
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
                .style('opacity',1);

            // configure behavior when nodes enter
            // append ellipse to each node group
            nodeEnter
                .append('ellipse')
                .attr('class', 'circle')
                .style('stroke', nodeStroke)
                .style('fill', function highlightNode(n) {
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
                })
                .attr('rx',1e-6)
                .attr('ry',1e-6)
                .transition(tIn)
                .attr('rx', rx)
                .attr('ry', ry);

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



            // // // REMOVE // // //
            const nodeExit = node
                .exit()
                .transition(tOut)
                    .style('opacity',1e-6)
                .remove();

            const linkExit = link
                .exit()
                .transition(tOut)
                    .style('opacity',1e-6)
                .remove();

        },

        linkOpacity: function(l) {
            // console.log(l);
            let isRequired;

            var parentIdx = l.source;
            var parentNode = dataModel.nodes[parentIdx];
            var childIdx = l.target;
            var childNode = dataModel.nodes[childIdx];

            var parent = dataModel.model['Ingest_LDD']['DD_Class'].find(c => {
                if (c.lid == parentNode.lid) {
                    return c;
                } else {
                    return false;
                }
            });

            parent['DD_Association'].map(a => {
                if (!a.lid) {
                    try {
                        a.lid = a.local_identifier[0];
                    } catch (e) {
                        a.lid = a.identifier_reference[0];
                    }
                }

                if (a.lid == childNode.lid) {
                    if (!childNode.minimum_occurrences) isRequired = true;
                    else if (childNode.minimum_occurrences[0] > 0) isRequired = true;
                    else isRequired = false;
                }

            });

            return isRequired ? required : optional;
        },

        toggleHighlights: function() {
            activeNodes = [];

            if (!dataModel.activeNode) {
                g1 = [];
                g2 = [];
                activeNodes = [];
            } else {
                g1 = [dataModel.activeNode];
                g2 = nextGen(g1);
                var nodeIdx = dataModel.getNode(dataModel.activeNode.lid,true);
                activeNodes = activeNodes
                    .concat(g1)
                    .concat(g2);
            };

            svg.selectAll('.link')
                .style('stroke', function(link) {
                    let _lid,
                        _active = null;

                    try {
                        _lid = dataModel.nodes[link.source]['local_identifier'][0];
                    } catch (err) {
                        _lid = dataModel.nodes[link.source]['identifier_reference'][0];
                    }

                    _active = g1.find(d => {
                        try {
                            return d['local_identifier'][0] == _lid;
                        } catch (err) {
                            return d['identifier_reference'][0] == _lid;
                        }
                    })

                    if (_active) {
                        return linkHighlightStroke;
                    } else if (!dataModel.activeNode || !dataModel.activeNode.parents) {
                        return linkStroke;
                    } else {
                        return dataModel.activeNode.parents.find(d => {
                            if (dataModel.getNode(d.lid,true) == link.source
                            && dataModel.getNode(dataModel.activeNode.lid,true) == link.target) {
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
                        _lid = dataModel.nodes[link.source]['local_identifier'][0];
                    } catch (err) {
                        _lid = dataModel.nodes[link.source]['identifier_reference'][0];
                    }

                    _active = g1.find(d => {
                        try {
                            return d['local_identifier'][0] == _lid;
                        } catch (err) {
                            return d['identifier_reference'][0] == _lid;
                        }
                    })

                    if (_active) {
                        return linkHighlightStrokeWidth;
                    } else if (!dataModel.activeNode || !dataModel.activeNode.parents) {
                        return linkStrokeWidth;
                    } else {
                        return dataModel.activeNode.parents.find(d => {
                            if (dataModel.getNode(d.lid,true) == link.source
                                    && dataModel.getNode(dataModel.activeNode.lid,true) == link.target) {
                                return d;
                            } else {
                                return false;
                            }
                        }) ? linkHighlightStrokeWidth : linkStrokeWidth;
                    }
                })
                .style('opacity', this.linkOpacity);

            svg.selectAll('.circle')
                .style('stroke', function(d) {
                    let _lid,
                        _active = null;

                    try {
                        _lid = d['local_identifier'][0];
                    } catch (err) {
                        _lid = d['identifier_reference'][0];
                    }

                    if (dataModel.activeNode && d.lid == dataModel.activeNode.lid) return activeNodeStroke;

                    _active = activeNodes.find(e => {
                        try {
                            return e['local_identifier'][0] == _lid;
                        } catch (err) {
                            return e['identifier_reference'][0] == _lid;
                        }
                    });

                    if (_active) {
                        return nodeHighlightStroke;
                    } else if (!dataModel.activeNode || !dataModel.activeNode.parents) {
                        return nodeStroke;
                    } else {
                        return dataModel.activeNode.parents.find(e => {
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
                    } else if (!dataModel.activeNode || !dataModel.activeNode.parents) {
                        return nodeStrokeWidth;
                    } else {
                        return dataModel.activeNode.parents.find(e => {
                            try {
                                return e['local_identifier'][0] == _lid;
                            } catch (err) {
                                return e['identifier_reference'][0] == _lid;
                            }
                        }) ? nodeHighlightStrokeWidth : nodeStrokeWidth;
                    }

                })
            $rootScope.$applyAsync();
        }
    }
});
