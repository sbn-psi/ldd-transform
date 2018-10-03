app.factory('DataModel', function($window,$injector,$rootScope) {
    let _col;
    let model;
    let newLddMode = false;

    if (window.localStorage.getItem('ld3')) {
        model = JSON.parse(window.localStorage.getItem('ld3'));
    } else {
        newLddMode = true;
        model = _template
    };

    const Data = {
        setActiveNode: function(node,boo) {
            if (this.activeNode == node) this.activeNode = null;
            else this.activeNode = node;

            if (!boo) $injector.get('Visualizations').toggleHighlights();
        },
        activeNode: null,
        rootNodes: [],
        
        history: [],
        maxHistory: 10,
        historyIdx: 0,

        newLddMode: newLddMode,

        nodes: [],
        links: [],

        model: model,

        timeTravel: function(newModel) {
            this.model = JSON.parse(newModel);
            this.updateNodes();
            this.updateLinks();
            this.setActiveNode(this.getNode(this.activeNode.lid),true);
        },

        pureModel: function() {
            // make a copy of the model so the active copy is not altered
            var model = JSON.parse(JSON.stringify(this.model));

            model['Ingest_LDD']['DD_Class'] = scrapeCustomKeywords(model['Ingest_LDD']['DD_Class']);
            model['Ingest_LDD']['DD_Attribute'] = scrapeCustomKeywords(model['Ingest_LDD']['DD_Attribute']);

            function scrapeCustomKeywords(array) {
                var keywords = [
                    'children'
                    ,'parents'
                    ,'className'
                    ,'col'
                    ,'lid'
                    ,'rootNode'
                    ,'value_domain'
                    ,'x'
                    ,'y'
                    ,'$$hashKey'
                ];

                array.map(c => {
                    if (c['DD_Association']) c['DD_Association'] = scrapeCustomKeywords(c['DD_Association']);
                    keywords.map(k => {
                        delete c[k];
                    });

                    return c;
                });

                return array;
            };

            // update 'last_modification_date_time'
            model['Ingest_LDD']['last_modification_date_time'] = [`${moment.utc().format()}`];

            return model;
        },

        ldd: function() {
            const model = this.model['Ingest_LDD'];
            const lddDetails = function() {
                return {
                    name: model['name'][0],
                    ldd_version_id: model['ldd_version_id'][0],
                    full_name: model['full_name'][0],
                    steward_id: model['steward_id'][0],
                    namespace_id: model['namespace_id'][0],
                    comment: model['comment'][0],
                    pds4_im_version: this.pds4IMVersion
                }
            };
            return {
                original: new lddDetails,
                edit: new lddDetails
            };
        },

        updateNodes: function() {
            this.nodes = [];

            const model = this.model['Ingest_LDD'];

            let classes = model['DD_Class'];
            classes.map(d => {
                d.className = 'class';
                this.nodes.push(d);
            });

            let attributes = model['DD_Attribute'];
            if (!attributes) attributes = [];
            else attributes.map(d => {
                d.className = 'attribute';
                this.nodes.push(d);
            });

        },

        updateLinks: function() {
            this.links = [];

            this.nodes.map((e, idx) => {

                e.children = [];
                let targets = e['DD_Association'];

                if (targets && targets.length) {
                    targets.map(target => {

                        let sourceLid,
                            targetLid;

                        try {
                            sourceLid = e['local_identifier'][0];
                        } catch (err) {
                            sourceLid = e['identifier_reference'][0];
                        }

                        try {
                            targetLid = target['local_identifier'][0];
                        } catch (err) {
                            targetLid = target['identifier_reference'][0];
                        }

                        // search for lid in this.nodes array
                        let match = this.nodes.find(el => {
                            let _output;
                            try {
                                _output = el['local_identifier'][0] === targetLid;
                            } catch (err) {
                                _output = el['identifier_reference'][0] === targetLid;
                            }
                            return _output;
                        });

                        if (!match) {
                            // create new node
                            // in pds namespace
                            target.className = 'attribute';
                            try {
                                target.name = [target['local_identifier'][0].replace('pds.', '')];
                            } catch (err) {
                                target.name = [target['identifier_reference'][0].replace('pds.', '')];
                            }
                            this.nodes.push(target);
                            // then create a link in this.links array
                            let _targetIdx = this.nodes.length - 1;

                            let l = {
                                source: idx,
                                target: _targetIdx,
                                id: `${sourceLid}:${targetLid}`
                            };
                            this.links.push(l);
                        } else {
                            let t = this.nodes.indexOf(match);
                            let l = {
                                source: idx,
                                target: t,
                                id: `${sourceLid}:${targetLid}`
                            };
                            this.links.push(l);
                        }
                        e.children.push(target);
                    })

                }
            });

            _col = 1;

            // // // // // // // // // // //
            // identify and define root nodes
            _nodes = this.nodes.map((node, idx) => {
                let _match = this.links.find(link => link.target == idx);
                if (!_match) {
                    node.rootNode = true;
                    node.col = _col;
                    this.rootNodes.push(node);
                };

                return node;
            });

            this.sortCols(this.rootNodes);
        },

        defineNodesAndLinks: function() {
            this.updateNodes();
            this.updateLinks();
            if (this.historyIdx != 0) {
                this.history.splice(0,this.historyIdx,JSON.stringify(this.model));
            } else {
                this.history.unshift(JSON.stringify(this.model));
            }
            this.historyIdx = 0;
        },

        sortCols: function(nodes) {
            let nextCol = [];
            _col++;

            // for each root element, find its child elements
            nodes.map(root => {
                let _children = root['DD_Association'];
                if (_children && _children.length) {
                    // check that each child exists as an element in this.nodes
                    _children.map(_child => {
                        let found = this.nodes.find(dn => {
                            let dnLid,
                                _childLid;

                            try {
                                dnLid = dn.local_identifier[0];
                            } catch (err) {
                                dnLid = dn.identifier_reference[0];
                            }

                            try {
                                _childLid = _child.local_identifier[0];
                            } catch (err) {
                                _childLid = _child.identifier_reference[0];
                            }

                            // if it exists, set its class
                            // then pass it into array for storage
                            // to be passed into recursive function upon completion of find() method
                            if (dnLid == _childLid) {
                                dn.col = _col;

                                // push node object to array of nodes in this column
                                // perform the same sequence of steps for each node
                                // in the new array
                                nextCol.push(dn);
                            }
                        });
                    });
                }
            });

            if (nextCol.length) this.sortCols(nextCol);

            this.imVersion().set();

            localStorage.setItem('ld3',JSON.stringify(this.model));
        },

        removeNode: function(lid) {
            let node = this.getNode(lid);
            let array = node.className == 'class' ? 'DD_Class' : 'DD_Attribute';

            this.model['Ingest_LDD'][array] = this.model['Ingest_LDD'][array].filter(function(el) {
                return el.lid != lid;
            });

            this.defineNodesAndLinks();
        },

        getNode: function(lid,getIdx) {
            let nodeIdx;
            let node;

            this.nodes.map((d,idx) => {
                let dLid;

                try {
                    dLid = d['local_identifier'][0];
                } catch (err) {
                    dLid = d['identifier_reference'][0];
                }

                if (lid == dLid) {
                    nodeIdx = idx;
                    node = d;
                }
            });

            if (getIdx) return nodeIdx;
            else return node;
        },

        addAttribute: function(node) {
            // create DD_Attribute definition
            const newAttribute = {
                name: [node.name],
                version_id: [node.version_id],
                local_identifier: [node.local_identifier],
                lid: [this.ldd().original.namespace_id[0] + '.' + node.name],
                nillable_flag: [node.nillable_flag],
                submitter_name: [node.submitter_name],
                definition: [node.definition],
                DD_Value_Domain: {
                    enumeration_flag: [node.enumeration_flag],
                    value_data_type: [node.value_data_type],
                    minimum_value: [node.minimum_value],
                    maximum_value: [node.maximum_value],
                    unit_of_measure_type: [node.unit_of_measure_type]
                }
            };

            const index = this.model['Ingest_LDD']['DD_Attribute'].length;
            this.model['Ingest_LDD']['DD_Attribute'].push(newAttribute);

            // create link between newAttribute and activeNode
            const newNode = this.model['Ingest_LDD']['DD_Attribute'][index];

            // add reference to attribute from activeNode
            this.activeNode['DD_Association'].push({
                identifier_reference: [node.local_identifier],
                reference_type: ['attribute_of'],
                minimum_occurrences: [node.minimum_occurrences],
                maximum_occurrences: [node.maximum_occurrences],
                DD_Attribute_Reference: {
                    namespace_id: [this.ldd().namespace_id],
                    name: [node.name]
                }
            });

            this.defineNodesAndLinks();
        },

        addClass: function(node,newLddMode) {
            // create DD_Class definition
            const newClass = {
                name: [node.name],
                version_id: [node.version_id],
                local_identifier: [node.local_identifier],
                lid: [this.ldd().original.namespace_id[0] + '.' + node.name],
                submitter_name: [node.submitter_name],
                definition: [node.definition],
                DD_Association: []
            };

            const index = this.model['Ingest_LDD']['DD_Class'].length;
            this.model['Ingest_LDD']['DD_Class'].push(newClass);

            // create link between newClass and activeNode
            // by adding reference to class from activeNode
            if (newLddMode) return this.defineNodesAndLinks();

            this.activeNode['DD_Association'].push({
                identifier_reference: [node.local_identifier],
                reference_type: ['component_of'],
                minimum_occurrences: [node.minimum_occurrences],
                maximum_occurrences: [node.maximum_occurrences],
                DD_Class_Reference: {
                    namespace_id: [this.ldd().namespace_id],
                    name: [node.name]
                }
            });

            this.defineNodesAndLinks();
        },

        getParents: function(idx) {
            var parents = [];
            var childNode = this.nodes[idx];

            this.links.map(l => {
                var source = l.source;
                var target = l.target;
                if (target == idx) parents.push(this.nodes[source]);
            });

            return parents;
        },

        createLink: function(node) {
            if (node == this.activeNode) {
                alert('Error: Cannot make a class its own parent.');
                return false;
            };

            // active node should always be parent
            const parentIdx = this.getNode(this.activeNode.lid,true);
            const childIdx = this.getNode(node.lid,true);

            const parent = this.nodes[parentIdx];
            const child = this.nodes[childIdx];
            
            const parentParents = this.getParents(parentIdx);
            const childIsParent = parentParents.find(function(elem) {
                return elem == child;
            });
            if (childIsParent) {
                alert('Error: Cannot make a parent node the child of its own child.');
                return false;
            }

            this.model['Ingest_LDD']['DD_Class'] = this.model['Ingest_LDD']['DD_Class'].map(classNode => {
                if (classNode.lid == parent.lid) {
                    let output = {
                        identifier_reference: node['local_identifier'],
                        reference_type: (() => {
                            return (node['className'] == 'class') ? ['component_of'] : ['attribute_of'];
                        })(),
                        minimum_occurrences: null,
                        maximum_occurrences: null,
                        DD_Class_Reference: {
                            namespace_id: [node['local_identifier'][0].split('.')[0]],
                            name: node['name']
                        }
                    };
                    classNode['DD_Association'].push(output);
                };

                return classNode;
                
            });

            this.defineNodesAndLinks();
            return true;
        },

        removeLink: function(lid) {
            // remove referenced lid from activeNode
            this.activeNode['DD_Association'] = this.activeNode['DD_Association'].filter(ref => {
                return ref.lid != lid;
            });

            this.updateNodes();
            this.updateLinks();

            const links = this.getLinks(lid);

            if (!links.length) this.removeNode(lid);
            else this.defineNodesAndLinks();
        },

        getLinks: function(lid) {
            const node = this.getNode(lid);
            const index = this.getNode(lid,true);
            let links = [];
            this.links.map(link => {
                if (link.source == index) links.push(link);
                if (link.target == index) links.push(link);
            });
            return links;
        },

        imVersion: function(ver) {
            var that = this;
            return {
                get: function() {
                    return that.pds4IMVersion;
                },

                set: function(ver) {
                    var model = that.model['Ingest_LDD']['$'];
                    if (ver) {
                        var current = that.pds4IMVersion;
                        for (var key in model) {
                            model[key] = model[key].replace(current,ver);
                        }
                        that.pds4IMVersion = ver;
                    } else {
                        that.model['Ingest_LDD']['$'];
                        that.pds4IMVersion = ver;
                        for (var key in model) {
                            let v = model[key].match(/[a-zA-Z0-9]{4}(?=\.xsd)/g);
                            if (v) that.pds4IMVersion = v[0];
                        }
                    }
                }
            }
        },

        modifyLddDetails: function(deets) {
            for (const d in deets) {
                if (d == 'pds4_im_version') this.imVersion().set(deets[d]);
                else this.model['Ingest_LDD'][d] = [deets[d]];
            };

            this.defineNodesAndLinks();
            this.ldd();
        },

        modifyAttribute: function(lid, values) {
            const node = this.getNode(lid);
            const type = 'DD_Attribute';

            this.model['Ingest_LDD'][type] = this.model['Ingest_LDD'][type].map(el => {
                if (el.lid == lid) {
                    // if (type == 'DD_Attribute') {
                    //     node['DD_Value_Domain'][0] = values['value_domain'];
                    // };
                    for (const d in values) {
                        el[d] = [values[d]];
                    };
                }
                return el;
            });

            this.defineNodesAndLinks();
        },

        modifyClass: function(lid,values) {
            const node = this.getNode(lid);
            const type = 'DD_Class';

            this.model['Ingest_LDD'][type] = this.model['Ingest_LDD'][type].map(el => {
                if (el.lid == lid) {
                    for (const d in values) {
                        el[d] = [values[d]];
                    };
                };

                return el;
            });

            this.defineNodesAndLinks();
        }
    };

    Data.defineNodesAndLinks();

    return Data;
});
