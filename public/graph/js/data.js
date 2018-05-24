function Data(json) {
    let _col;
    
    this.model = JSON.parse(json);
    
    this.pureModel = function() {
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
    };

    this.rootNodes = [];
    
    this.defineNodesAndLinks = function() {
        // create/update nodes and links
        this.nodes = [];
        
        this.links = [];
        
        let model = this.model;

        let dd_class = model['Ingest_LDD']['DD_Class'];
        let dd_attribute = model['Ingest_LDD']['DD_Attribute'];
        
        // // // /// // // //  // // //
        // set class name for each node
        dd_class.map(c => {
            c.className = 'class';
            this.nodes.push(c);
        });
        
        dd_attribute.map(a => {
            a.className = 'attribute';
            this.nodes.push(a);
        });

        let id = 0;
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
                    // console.log(sourceLid,targetLid);
                    // invalid 
                    if (targetLid == 'XSChoice#') return;

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

        // // // // // // // // // // //
        // identify and define root nodes
        this.nodes = this.nodes.map((node, idx) => {
            let _match = this.links.find(link => link.target == idx);
            if (!_match) {
                node.rootNode = true;
                node.col = 1;
                this.rootNodes.push(node);
            };
            
            return node;
        });
        
        _col = 1;
        
        this.sortCols(this.rootNodes);
        
        localStorage.setItem('ld3',JSON.stringify(this.model));
    };
    
    // // // // // // // // // // // sortCols(rootNodes)
    // set col attribute on each node for use later during positioning
    // recursive function, begin with root nodes
    this.sortCols = function(nodes) {
        let nextCol = [];
        _col++;

        // for each root element, find its child elements
        nodes.map(root => {
            let _children = root['DD_Association'];
            if (_children && _children.length) {
                // check this each child exists as an element in this.nodes
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
    };
    
    this.deleteNode = function(lid) {
        let linkCount = 0;
        
        // // // // // Update Model // // // // //
        // remove node from 'DD_Association' and 'chilren' arrays
        var pLid = activeNode.lid;      // parent lid
        var aLid = lid;                 // associated lid
        var nodeIdx = this.getNode(lid,true);
        
        this.model['Ingest_LDD']['DD_Class'].map(filterAssociations);
        this.model['Ingest_LDD']['DD_Attribute'].map(filterAssociations);
        
        this.links.map(l => {
            if (l.source == nodeIdx
                || l.target == nodeIdx) {
                linkCount++;
            }
        });
        
        // remove element definition from
        // 'DD_Class' or 'DD_Attribute'
        if (linkCount == 1) this.removeNodeDefinition(lid);
        
        this.defineNodesAndLinks();
        
        update();
        
        toggleNodes();
        
        function filterAssociations(d) {
            if (d.lid == pLid) {
                d['DD_Association'] = d['DD_Association'].filter(a => {
                    try {
                        return (a['local_identifier'][0] == aLid) ? false : true;
                    } catch (err) {
                        return (a['identifier_reference'][0] == aLid) ? false : true;
                    }
                });
                d['children'] = d['children'].filter(c => {
                    try {
                        return (c['local_identifier'][0] == aLid) ? false : true;
                    } catch (err) {
                        return (c['identifier_reference'][0] == aLid) ? false : true;
                    }
                });
            };
            return d;
        };
    };
    
    this.removeNodeDefinition = function(lid) {
        let node = this.getNode(lid);
        let array = node.className == 'class' ? 'DD_Class' : 'DD_Attribute';
        
        this.model['Ingest_LDD'][array] = this.model['Ingest_LDD'][array].filter(function(el) {
            if (el.lid == lid) return false;
            else return true;
        });
    };
    
    this.parents = function(lid,getIdx) {
        let idx = this.getNode(lid,true);
        let _parents = [];
        
        this.links.map(l => {
            if (l.target == idx) _parents.push(l.source);
        });
        
        if (getIdx) {
            return _parents;
        } else {
            _parents = _parents.map(p => {
                return data.nodes[p];
            });
            
            return _parents;
        }
        
    };
    
    this.getNode = function(lid,getIdx) {
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
    };
    
    // // // // // // // CREATE // // // // // // //
    this.addNode = function(node) {
        let type = node.reference_type == 'component_of' ? 'class' : 'attribute';
        let modelArray = type == 'class' ? 'DD_Class' : 'DD_Attribute';

        // // // // // UPDATE MODEL // // // // //
        // add global keyword definition
        let nodeGlobal = {
            name: [node.name],
            className: type,
            version_id: [node.version_id],
            identifier_reference: [node.identifier_reference],
            submitter_name: [node.submitter_name],
            definition: [node.definition]
        };

        if (type == 'class') {
            nodeGlobal['DD_Association'] = [];
            nodeGlobal['children'] = [];
        } else if (type == 'attribute') {
            nodeGlobal['nillable_flag'] = [node.nillable_flag],
            nodeGlobal['DD_Value_Domain'] = [];
        }

        this.model['Ingest_LDD'][modelArray].push(nodeGlobal);
        
        // add keyword instance definiton to 
        // parent node "DD_Association" and "children" arrays
        let nodeInstance = {
            name: [node.name],
            col: activeNode.col + 1,
            className: type,
            definition: [node.definition],
            identifier_reference: [node.identifier_reference],
            version_id: [node.version_id],
            submitter_name: [node.submitter_name],
            definition: [node.definition],
            
            identifier_reference: [node.identifier_reference],
            reference_type: [node.reference_type],
            minimum_occurrences: [node.minimum_occurrences],
            maximum_occurrences: [node.maximum_occurrences],
            name: [node.name]
        };
        let modelParent = this.model['Ingest_LDD']['DD_Class'].find(p => { 
            try {
                return p['local_identifier'][0] == activeNode.lid;
            } catch (err) {
                return p['identifier_reference'][0] == activeNode.lid;
            }
        });
            
        let modelIdx = this.model['Ingest_LDD']['DD_Class'].indexOf(modelParent);

        this.model['Ingest_LDD']['DD_Class'][modelIdx]['DD_Association'].push(nodeInstance);
        this.model['Ingest_LDD']['DD_Class'][modelIdx]['children'].push(nodeInstance);
        
        // // // // // UPDATE D3 // // // // //

        let parent = this.nodes.find(el => { return el.lid == activeNode.lid; });
        let parentIdx = this.nodes.indexOf(parent);
        
        this.defineNodesAndLinks();
        
        update();
    };
    
    this.getParents = function(idx) {
        var parents = [];
        var childNode = this.nodes[idx];
        
        this.links.map(l => {
            var source = l.source;
            var target = l.target;
            if (target == idx) parents.push(this.nodes[source]);
        });
        
        return parents;
    };
    
    this.createNode = function() {
        newModal('node');
    };
    
    this.createLink = function(node) {
        var sourceCol = data.getNode(activeNode.lid).col;
        var targetCol = data.getNode(node.lid).col;
        var sourceIdx = data.getNode(activeNode.lid,true);
        var targetIdx = data.getNode(node.lid,true);
        var parentIdx,
            childIdx;
        
        if (sourceCol == targetCol) {
            parentIdx = sourceIdx;
            childIdx = targetIdx;
        } else {
            parentIdx = (sourceCol < targetCol) ? sourceIdx : targetIdx;
            childIdx = (sourceCol > targetCol) ? sourceIdx : targetIdx;
        }
        
        var parent = data.nodes[parentIdx];
        var child = data.nodes[childIdx];
        
        data.model['Ingest_LDD']['DD_Class'] = data.model['Ingest_LDD']['DD_Class'].map(c => {
            if (c.lid == parent.lid) {
                c['DD_Association'].push(child);
                c['children'].push(child);
            };
            
            return c;
        });
        
        this.linkMode(null);
        
        this.defineNodesAndLinks();
        
        update();
    };
    
    this.linkMode = function(node) {
        if (linkMode && event.target.id == 'create-link') linkMode = false;
        else if (!node || node == null) linkMode = false;
        else linkMode = true;
        
        updateToolbar();
    };
    
    this.imVersion = function(ver) {
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
    }
    
    this.modifyLddDetails = function(deets) {
        for (const d in deets) {
            if (d == 'pds4_im_version') this.imVersion().set(deets[d]);
            else this.model['Ingest_LDD'][d] = [deets[d]];
        };
    };
    
    this.modifyNode = function(lid,values) {
        var node = this.getNode(lid);
        var type = node.className == 'class' ? 'DD_Class' : 'DD_Attribute';
        
        this.model['Ingest_LDD'][type] = this.model['Ingest_LDD'][type].map(el => {
            if (el.lid == lid) {
                if (type == 'DD_Attribute') {
                    node['DD_Value_Domain'][0] = values['value_domain'];
                };
            
                for (const d in values) {
                    el[d] = [values[d]];
                };
            };
        
            return el;
        });
        
        this.defineNodesAndLinks();
        
        update();
        
    };
    
    this.defineNodesAndLinks();
};