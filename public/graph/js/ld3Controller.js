app.controller('ld3Controller', ['$scope', '$window', 'Data', 'Modal', 'Visualizations', function($scope, $window, Data, Modal, Visualizations) {
    let activeNodes = [];
    let g1;
    let g2;

    const toolbarWidth = '400';                             // px
    const width = $(document).width() - toolbarWidth;
    const height = $(document).height();
    const tDuration = 1000;                                 // transition duration (ms)

    // Edges (Lines)
    const linkHighlightStroke = 'orange';
    const linkHighlightStrokeWidth = '5px';
    const linkStroke = 'black';
    const linkStrokeWidth = '1px';
    const optional = 0.25;                                  // link opacity
    const required = 1;                                     // link opacity

    // Nodes
    const rx = 70;                                          // x radius of ellipse
    const ry = 20;                                          // y radius of ellipse
    const verticalOffset = 50;                              // px
    const verticalPadding = 5;                              // px
    const verticalSpacing = ry * 2 + verticalPadding;       // px
    const rootNodeFill = 'lightgreen';
    const classNodeFill = '#ADD8E6';
    const attributeNodeFill = 'white';
    const activeNodeStroke = '#666666';
    const nodeStroke = 'black';
    const nodeStrokeWidth = '1px';
    const nodeHighlightStroke = 'orange';
    const nodeHighlightStrokeWidth = '3px';

    const colWidth = 225;                                   // px
    const xOffset = 100;                                    // px

    // initialize application state
    $scope.modal = Modal.new();
    $scope.vis = Visualizations.new();
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
            toggleHighlights(null);

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
            toggleHighlights(null);

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
            $scope.ldd = {
                original: $scope.data.ldd(),
                edit: $scope.data.ldd()
            };
            update();

            if ($scope.newLddMode) {
                $scope.ld3.openAddNodeModal();
            };

            return;
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
                    $scope.data.defineNodesAndLinks();
                }
            });
        }
    };

    // // // // // // //
    // INITIALIZE D3  //
    // // // // // // //
    $scope.vis.initGrid();

    if (window.localStorage.getItem('ld3')) {
        const json = window.localStorage.getItem('ld3');
        $scope.vis.update(json);
        $scope.data = Data.new(json);
    } else {
        const json = JSON.stringify(_template);
        $scope.modal.open('editLdd');
        $scope.errors = {};
        $scope.newLddMode = true;
        $scope.vis.update(json);
    };

    $scope.ldd = {
        original: $scope.data.ldd(),
        edit: $scope.data.ldd()
    };

    // // // // // // //
    // HELPER METHODS //
    // // // // // // //

    function toggleHighlights(targetNode) {
        if ($scope.ld3.linkMode) {
            $scope.data.createLink(targetNode,$scope.data.activeNode);
            $scope.ld3.linkMode = false;
            update($scope.data);
        }

        activeNodes = [];

        if ($scope.data.activeNode == targetNode) {
            $scope.data.activeNode = null;
        } else if (!targetNode) {
            g2 = nextGen(g1);
            activeNodes = activeNodes
                .concat(g1)
                .concat(g2)
        } else {
            g1 = [targetNode];
            g2 = nextGen(g1);
            var nodeIdx = $scope.data.getNode(targetNode.lid,true);
            $scope.data.activeNode = $scope.data.nodes[nodeIdx];
            $scope.data.activeNode.parents = $scope.data.getParents(nodeIdx);
            activeNodes = activeNodes
                .concat(g1)
                .concat(g2)
        }

        $scope.vis.svg.selectAll('.link')
            .style('stroke', function(link) {
                let _lid,
                    _active = null;

                try {
                    _lid = $scope.data.nodes[link.source]['local_identifier'][0];
                } catch (err) {
                    _lid = $scope.data.nodes[link.source]['identifier_reference'][0];
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
                    _lid = $scope.data.nodes[link.source]['local_identifier'][0];
                } catch (err) {
                    _lid = $scope.data.nodes[link.source]['identifier_reference'][0];
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

        $scope.vis.svg.selectAll('.circle')
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
            let source = $scope.data.nodes[link.source];
            let target = $scope.data.nodes[link.target];

            if (parent && parent.indexOf(source) != -1 && _nextGen.indexOf(target) == -1) {
                _nextGen.push(target);
            }
        });

        return _nextGen;
    };

}]);
