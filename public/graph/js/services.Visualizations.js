app.factory('Visualizations', function(DataModel, $rootScope) {
    const dataModel = DataModel;

    // milligram
    const $primary = '#9b4dca';
    const $primaryLight = '#cda6e4';
    const $secondary = '#606c76';
    const $tertiary = '#f4f5f6';
    const $quaternary = '#d1d1d1';
    const $quinary = '#e1e1e1';
    const $initial = '#ffffff';

    const width = $(document).width();
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

    const Link = {
        stroke: function(link) {
            // set link colors
            return $secondary;
        },
        
        strokeWidth: function(link) {
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
            });

            return (_active) ? '3px' : '1px';
        },
        opacity: function(link) {
            const optional = 0.25;
            const required = 1;
            let isRequired = null;

            var parentIdx = link.source;
            var parentNode = dataModel.nodes[parentIdx];
            var childIdx = link.target;
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
                    if (!angular.isDefined(childNode.minimum_occurrences)) isRequired = false;
                    else if (childNode.minimum_occurrences[0] > 0) isRequired = true;
                    else isRequired = false;
                }

            });

            // this method is broken: currently returning 1 for all links
            return '1';
        }
    };

    const Node = {
        height: 40,
        width: 200,
        
        offsetY: -20,
        offsetX: 0,
        
        spacing: {
            x: 100,
            y: 50
        },
        padding: {
            // inital offset for root node
            x: 150,
            y: 50
        },
        
        'colWidth': 225,
        'strokeWidth': '1px',
        'nodeHighlightStrokeWidth': '3px',
        
        fill: function(node) {
            if (node.rootNode) return $secondary;
            else if (node.className === 'class') return $quaternary;
            else return $initial;
        },
        
        stroke: function(node) {
            // set rect border colors
            let _lid,
                _active = null;

            try {
                _lid = node['local_identifier'][0];
            } catch (err) {
                _lid = node['identifier_reference'][0];
            }

            // catch active node, set custom stroke
            if (dataModel.activeNode && node.lid == dataModel.activeNode.lid) return $primary;

            _active = activeNodes.find(e => {
                try {
                    return e['local_identifier'][0] == _lid;
                } catch (err) {
                    return e['identifier_reference'][0] == _lid;
                }
            });

            if (_active) {
                return $primaryLight;
            } else if (node.className === 'class') {
                return $secondary;
            } else {
                return $secondary;
            };
        },
        
        text: {
            fontSize: 18,
            
            fill: function(d) {
                return (d.rootNode) ? $initial : $secondary;
            }
        }
    };

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
                    
                    // console.log(d.col);
                    if (!d.col) console.log(d);
                    d.x = d.col * Node.colWidth - Node.spacing.x;
                    d.y = (Node.spacing.y * idx) + Node.padding.y;

                    d.lid = lidId;

                    return d.lid;
                });

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
                .attr('transform',function(d) {
                    return `translate(${d.x},${d.y})`;
                });

            const title = svg.selectAll('.node-title')
                .text(function(d) {
                    return d.name[0];
                });

            // INITIAL link state
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
                .attr('stroke', Link.stroke)
                .attr('stroke-width', Link.strokeWidth)
                .transition(tIn)
                    .delay(100)
                    .style('opacity', Link.opacity);

            const nodeEnter = node
                .enter()
                .append('g')
                .classed('node', true)
                .on('click', target => dataModel.setActiveNode(target))
                .attr('id', function(d) {
                    let _id;

                    try {
                        _id = d['local_identifier'][0].replace('.', '-');
                    } catch (err) {
                        _id = d['identifier_reference'][0].replace('.', '-');
                    }

                    return _id;
                })
                .attr('data-class', d => d.className === 'class')
                .attr('data-attr',  d => d.className === 'attribute')
                .style('opacity',1e-6);

            nodeEnter.transition(tIn)
                .style('opacity',1);

            // configure behavior when nodes enter
            // append ellipse to each node group
            nodeEnter
                .append('rect')
                .attr('class', 'rect')
                .style('stroke', Node.stroke)
                .style('fill', Node.fill)
                .attr('y', Node.offsetY)
                .attr('x', Node.offsetX)
                .attr('width', Node.width)
                .attr('height', Node.height);

            // append text to each node group
            nodeEnter
                .append('text')
                .attr('class','node-title')
                .text(d => d.name[0])
                .style('font-size', Node.text.fontSize)
                .style('fill', Node.text.fill)
                .attr('dx', () => 3 + Node.offsetX)
                .attr('dy', () => 10)
                .style('opacity',1e-6)
                .transition(tIn)
                .style('opacity',1);

            nodeEnter
                .attr('transform', function(d, idx) {
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
                .style('stroke', $secondary)
                .style('stroke-width', Link.strokeWidth)
                .style('opacity', Link.opacity);

            svg.selectAll('.rect')
                .style('stroke', Node.stroke)
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
                        return Node.nodeHighlightStrokeWidth;
                    } else if (!dataModel.activeNode || !dataModel.activeNode.parents) {
                        return Node.nodeStrokeWidth;
                    } else {
                        return dataModel.activeNode.parents.find(e => {
                            try {
                                return e['local_identifier'][0] == _lid;
                            } catch (err) {
                                return e['identifier_reference'][0] == _lid;
                            }
                        }) ? Node.nodeHighlightStrokeWidth : Node.nodeStrokeWidth;
                    }

                })
            $rootScope.$applyAsync();
        }
    }
});
