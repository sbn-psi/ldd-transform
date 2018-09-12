app.controller('ld3Controller', ['$scope', '$window', 'DataModel', 'Modal', function($scope, $window, DataModel, Modal) {
    // initialize application state
    $scope.modal = Modal.new();
    $scope.data = DataModel;
    $scope.ldd = $scope.data.ldd();
    $scope.ld3 = {
        isVisible: {
            legend: true,
            lddDetails: false,
            activeNodeDetails: false,
        },
        isEnabled: {
            addNode: function() {
                if ($scope.ld3.linkMode) return false;
                if (!$scope.data.activeNode) return false;

                const refType = $scope.data.activeNode.className;
                if (refType == 'attribute') return false;

                return true;
            },
            addLink: function() {
                if (!$scope.data.activeNode) return false;

                return true;
            }
        },
        linkMode: false,
        addLink: function() {
            $scope.ld3.linkMode = !$scope.ld3.linkMode;
        },
        removeLink: function(lid /* lid of node to be removed from activeNode */) {
            const confirmed = confirm('Are you sure you want to remove this link?');

            if (confirmed) $scope.data.removeLink(lid);

            update();

            return;
        },
        openAddNodeModal: function(refType) {
            $scope.modal.open('addNode');
            $scope.errors = {};

            $scope.newNode = {
                reference_type: 'component_of',
                unit_of_measure_type: 'Units_of_None',
                value_data_type: 'ASCII_Real',
                version_id: '1.0',
                namespace_id: $scope.ldd.original.namespace_id,
                submitter_name: $scope.ldd.original.full_name
            };
        },
        editNode: function() {
            $scope.modal.open('editNode');
            $scope.errors = {};
            $scope.modifiedNode = JSON.parse(JSON.stringify($scope.data.activeNode));
            $scope.modifiedNode.namespace_id = [$scope.modifiedNode['lid'].split('.')[0]];
        },
        addAttribute: function() {
            let errors = {};

            if (!$scope.newNode.name) errors.name = 'Name is required.';
            if (!$scope.newNode.version_id) errors.version_id = 'Version is required.';
            if (!$scope.newNode.namespace_id) errors.namespace_id = 'Namespace is required.';
            if (!$scope.newNode.submitter_name) errors.submitter_name = 'Submitter Name is required.';
            if (!$scope.newNode.definition) errors.definition = 'Definition is required.';
            if (!$scope.newNode.minimum_occurrences) errors.minimum_occurrences = 'Minimum Occurrences is required.';
            if (!$scope.newNode.maximum_occurrences) errors.maximum_occurrences = 'Maximum Occurrences is required.';
            if (!angular.isDefined($scope.newNode.nillable_flag)) errors.nillable_flag = 'Nillable Flag is required.';
            if (!angular.isDefined($scope.newNode.enumeration_flag)) errors.enumeration_flag = 'Enumeration Flag is required.';

            if (Object.keys(errors).length) return $scope.errors = errors;

            $scope.newNode.local_identifier = `${$scope.newNode.namespace_id}.${$scope.newNode.name}`;

            $scope.data.addAttribute($scope.newNode);

            update();
            toggleNodes(null);

            $scope.modal.close();
            $scope.newNode = {};
            return;
        },
        addClass: function() {
            let errors = {};

            if (!$scope.newNode.name) errors.name = 'Name is required.';
            if (!$scope.newNode.version_id) errors.version_id = 'Version number is required.';
            if (!$scope.newNode.namespace_id) errors.namespace_id = 'Namespace is required.';
            if (!$scope.newNode.submitter_name) errors.submitter_name = 'Submitter Name is required.';
            if (!$scope.newNode.definition) errors.definition = 'Definition is required.';

            if (Object.keys(errors).length) return $scope.errors = errors;

            $scope.newNode.local_identifier = `${$scope.newNode.namespace_id}.${$scope.newNode.name}`;

            $scope.data.addClass($scope.newNode,$scope.newLddMode);
            $scope.newLddMode = false;

            update();
            toggleNodes(null);

            $scope.modal.close();
            $scope.newNode = {};
            return;
        },
        modifyAttribute: function() {
            const lid = $scope.data.activeNode.lid;
            const values = {
                name: $scope.modifiedNode['name'][0],
                version_id: $scope.modifiedNode['version_id'][0],
                local_identifier: $scope.modifiedNode['namespace_id'][0] + '.' + $scope.modifiedNode['name'][0],
                nillable_flag: $scope.modifiedNode['nillable_flag'][0],
                submitter_name: $scope.modifiedNode['submitter_name'][0],
                definition: $scope.modifiedNode['definition'][0],
            };

            $scope.data.modifyAttribute(lid,values);

            update();

            $scope.modal.close();
        },
        modifyClass: function() {
            const lid = $scope.data.activeNode.lid;
            const values = {
                name: $scope.modifiedNode['name'][0],
                version_id: $scope.modifiedNode['version_id'][0],
                local_identifier: $scope.modifiedNode['namespace_id'][0] + '.' + $scope.modifiedNode['name'][0],
                submitter_name: $scope.modifiedNode['submitter_name'][0],
                definition: $scope.modifiedNode['definition'][0]
            };

            $scope.data.modifyClass(lid,values);

            update();

            $scope.modal.close();
        },
        editLdd: function() {
            $scope.modal.open('editLdd');
            $scope.errors = {};
            return;
        },
        saveLdd: function() {
            const errors = {};

            if (!$scope.ldd.edit.name) errors.name = 'LDD Name is required.';
            if (!$scope.ldd.edit.ldd_version_id) errors.ldd_version_id = 'LDD Version is required.';
            if (!$scope.ldd.edit.full_name) errors.full_name = 'Full Name is required.';
            if (!$scope.ldd.edit.steward_id) errors.steward_id = 'Steward ID is required.';
            if (!$scope.ldd.edit.namespace_id) errors.namespace_id = 'Namespace is required.';
            if (!$scope.ldd.edit.comment) errors.comment = 'Comment is required.';

            if (Object.keys(errors).length) {
                return $scope.errors = errors;
            };

            $scope.modal.close();
            $scope.data.modifyLddDetails($scope.ldd.edit);
            $scope.ldd = $scope.data.ldd();

            if ($scope.newLddMode) {
                $scope.ld3.openAddNodeModal();
            };
        },
        download: function() {
            const currentModel = $scope.data.pureModel();
            const stewardId = currentModel['Ingest_LDD']['steward_id'][0].toUpperCase();
            const namespace = currentModel['Ingest_LDD']['namespace_id'][0].toUpperCase();
            const imVersion = $scope.data.pds4IMVersion;
            const lddVersion = currentModel['Ingest_LDD']['ldd_version_id'][0].replace(/\./g,'');

            const fileName = `${stewardId}_${namespace}_${imVersion}_${lddVersion}.xml`;

            $.ajax({
                type: 'POST',
                url: '../json/to/xml',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(currentModel),
                success: function(res) {
                    const blob = new Blob([res], {type: "text/xml;charset=utf-8"});
                    saveAs(blob,fileName);
                }
            });
        }
    };

    const toggleNodes = function(node) {
        if ($scope.ld3.linkMode) {
            $scope.data.createLink(node,$scope.data.activeNode);
            $scope.ld3.linkMode = false;
            update();
        }

        activeNodes = [];

        if ($scope.data.activeNode == node) {
            $scope.data.activeNode = null;
        } else if (!node) {
            g2 = nextGen(g1);
            activeNodes = activeNodes
                .concat(g1)
                .concat(g2)
        } else {
            g1 = [node];
            g2 = nextGen(g1);
            var nodeIdx = $scope.data.getNode(node.lid,true);
            $scope.data.activeNode = $scope.data.nodes[nodeIdx];
            $scope.data.activeNode.parents = $scope.data.getParents(nodeIdx);
            activeNodes = activeNodes
                .concat(g1)
                .concat(g2)
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

                _active = g1.find(d => {
                    try {
                        return d['local_identifier'][0] == _lid;
                    } catch (err) {
                        return d['identifier_reference'][0] == _lid;
                    }
                })

                if (_active) {
                    return linkHighlightStroke;
                } else if (!$scope.data.activeNode || !$scope.data.activeNode.parents) {
                    return linkStroke;
                } else {
                    return $scope.data.activeNode.parents.find(d => {
                        if ($scope.data.getNode(d.lid,true) == link.source
                        && $scope.data.getNode($scope.data.activeNode.lid,true) == link.target) {
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

                _active = g1.find(d => {
                    try {
                        return d['local_identifier'][0] == _lid;
                    } catch (err) {
                        return d['identifier_reference'][0] == _lid;
                    }
                })

                if (_active) {
                    return linkHighlightStrokeWidth;
                } else if (!$scope.data.activeNode || !$scope.data.activeNode.parents) {
                    return linkStrokeWidth;
                } else {
                    return $scope.data.activeNode.parents.find(d => {
                        if ($scope.data.getNode(d.lid,true) == link.source
                                && $scope.data.getNode($scope.data.activeNode.lid,true) == link.target) {
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

                if ($scope.data.activeNode && d.lid == $scope.data.activeNode.lid) return activeNodeStroke;

                _active = activeNodes.find(e => {
                    try {
                        return e['local_identifier'][0] == _lid;
                    } catch (err) {
                        return e['identifier_reference'][0] == _lid;
                    }
                });

                if (_active) {
                    return nodeHighlightStroke;
                } else if (!$scope.data.activeNode || !$scope.data.activeNode.parents) {
                    return nodeStroke;
                } else {
                    return $scope.data.activeNode.parents.find(e => {
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
                } else if (!$scope.data.activeNode || !$scope.data.activeNode.parents) {
                    return nodeStrokeWidth;
                } else {
                    return $scope.data.activeNode.parents.find(e => {
                        try {
                            return e['local_identifier'][0] == _lid;
                        } catch (err) {
                            return e['identifier_reference'][0] == _lid;
                        }
                    }) ? nodeHighlightStrokeWidth : nodeStrokeWidth;
                }

            })
        $scope.$applyAsync();
    };

    //
    //
    //
    //

    //
    //
    //
    //

    //
    //
    //
    //

    //
    //
    //
    //

    var id,
        data,
        svg,
        ldd = 'root',
        toolbarWidth = '400',
        width = $(document).width() - toolbarWidth,
        height = $(document).height(),
        tDuration = 1000, // transition duration (ms)
        // Edges (Lines)
        linkHighlightStroke = 'orange',
        linkHighlightStrokeWidth = '5px',
        linkStroke = 'black',
        linkStrokeWidth = '1px',
        // Nodes
        rx = 70, // x radius of ellipse
        ry = 20, // y radius of ellipse
        verticalOffset = 50,
        verticalPadding = 5,
        verticalSpacing = ry * 2 + verticalPadding,
        rootNodeFill = 'lightgreen',
        classNodeFill = '#ADD8E6',
        attributeNodeFill = 'white',
        activeNodeStroke = '#666666',
        nodeStroke = 'black',
        nodeStrokeWidth = '1px',
        nodeHighlightStroke = 'orange',
        nodeHighlightStrokeWidth = '3px',
        activeNodes = [],
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
            $scope.modal.open('editLdd');
            $scope.errors = {};
            $scope.newLddMode = true;
            main(JSON.stringify(_template));
        }
    };

    function main(json) {
        // remove old tree
        d3.select('.tree').remove();

        svg = d3.select('.main')
            .append('g')
            .attr('class', 'tree');

        update(json);
    };

    function update(json) {
        var tIn = d3.transition()
            .duration(1000);

        var tOut = d3.transition()
            .duration(1000);

        var link = svg.selectAll('.link')
            .data($scope.data.links,function(l,idx) {
                return l.id;
            })
            .datum(function(l,i,nodes) {
                // update link values to reflect new data indices
                let st = l.id.split(':');
                let s = $scope.data.getNode(st[0],true);
                let t = $scope.data.getNode(st[1],true);

                l.source = s;
                l.target = t;

                return l;
            });

        var node = svg.selectAll('g')
            .data($scope.data.nodes,function(d,idx) {
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

        node
            .transition()
            .duration(750)
            .delay(1000)
            .attr('transform',function(d) {
                return `translate(${d.x},${d.y})`;
            });
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
            sim.selectAll('.tick text').remove();
            gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
            gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
            svg.attr('transform', d3.event.transform);
        };

        sim.selectAll('.tick text').remove();
    };

    let g1;
    let g2;

    function linkOpacity(l) {
        var isRequired;

        var parentIdx = l.source;
        var parentNode = $scope.data.nodes[parentIdx];
        var childIdx = l.target;
        var childNode = $scope.data.nodes[childIdx];

        var parent = $scope.data.model['Ingest_LDD']['DD_Class'].find(c => {
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

        $scope.data.links.map(link => {
            let source = getNodeByIdx(link.source);
            let target = getNodeByIdx(link.target);

            if (parent && parent.indexOf(source) != -1 && _nextGen.indexOf(target) == -1) {
                _nextGen.push(target);
            }
        });

        return _nextGen;
    };

    function getNodeByIdx(nodeIdx) {
        return $scope.data.nodes[nodeIdx];
    };

}]);
