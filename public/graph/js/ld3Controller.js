app.controller('ld3Controller', ['$scope', '$window', 'DataModel', 'Modal', 'Visualizations', function($scope, $window, DataModel, Modal, Visualizations) {
    // initialize application state
    $scope.modal = Modal.new();
    $scope.vis = Visualizations;
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
                if ($scope.vis.linkMode) return false;
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
        toggleLinkMode: function() {
            $scope.vis.linkMode = !$scope.vis.linkMode;
        },
        removeLink: function(lid /* lid of node to be removed from activeNode */) {
            const confirmed = confirm('Are you sure you want to remove this link?');

            if (confirmed) $scope.data.removeLink(lid);

            $scope.vis.update();

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
            else if (/ /g.test($scope.newNode.name)) errors.name = 'No spaces allowed- consider replacing spaces with underscores.';
            
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

            $scope.vis.update();

            $scope.modal.close();
            $scope.newNode = {};
            return;
        },
        addClass: function() {
            let errors = {};

            if (!$scope.newNode.name) errors.name = 'Name is required.';
            else if (/ /g.test($scope.newNode.name)) errors.name = 'No spaces allowed- consider replacing spaces with underscores.';
            
            if (!$scope.newNode.version_id) errors.version_id = 'Version number is required.';
            if (!$scope.newNode.namespace_id) errors.namespace_id = 'Namespace is required.';
            if (!$scope.newNode.submitter_name) errors.submitter_name = 'Submitter Name is required.';
            if (!$scope.newNode.definition) errors.definition = 'Definition is required.';

            if (Object.keys(errors).length) return $scope.errors = errors;

            $scope.newNode.local_identifier = `${$scope.newNode.namespace_id}.${$scope.newNode.name}`;

            $scope.data.addClass($scope.newNode,$scope.data.newLddMode);
            $scope.data.newLddMode = false;

            $scope.vis.update();

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

            $scope.vis.update();

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

            $scope.vis.update();

            $scope.modal.close();
        },
        editLdd: function() {
            $scope.modal.open('editLdd');
            $scope.errors = {};
            return;
        },
        saveLdd: function() {
            const errors = {};
            const spaceError = function(keyword) {
                return `Spaces are not allowed in the ${keyword}. Consider using underscores instead.Spaces are not allowed in the ${keyword}. Consider using underscores instead.Spaces are not allowed in the ${keyword}. Consider using underscores instead.Spaces are not allowed in the ${keyword}. Consider using underscores instead.Spaces are not allowed in the ${keyword}. Consider using underscores instead.`;
            };

            const name = $scope.ldd.edit.name.trim();
            if (!name) errors.name = 'LDD Name is required.';
            else if (/ /g.test(name)) errors.name = spaceError('LDD name');
            
            if (!$scope.ldd.edit.ldd_version_id) errors.ldd_version_id = 'LDD Version is required.';
            if (!$scope.ldd.edit.full_name) errors.full_name = 'Full Name is required.';
            
            const stewardId = $scope.ldd.edit.steward_id.trim();
            if (!stewardId) errors.steward_id = 'Steward ID is required.';
            else if (/ /g.test(stewardId)) errors.steward_id = spaceError('steward ID');
            
            const namespaceId = $scope.ldd.edit.namespace_id.trim();
            if (!namespaceId) errors.namespace_id = 'Namespace is required.';
            else if (/ /g.test(namespaceId)) errors.namespace_id = spaceError('namespace ID');
            
            if (!$scope.ldd.edit.comment) errors.comment = 'Comment is required.';

            if (Object.keys(errors).length) {
                return $scope.errors = errors;
            };

            $scope.modal.close();
            $scope.data.modifyLddDetails($scope.ldd.edit);
            $scope.ldd = $scope.data.ldd();

            if ($scope.data.newLddMode) {
                $scope.ld3.openAddNodeModal();
            };
        },
        download: function() {
            let currentModel = $scope.data.pureModel();
            
            const stewardId = currentModel['Ingest_LDD']['steward_id'][0].toUpperCase();
            const namespace = currentModel['Ingest_LDD']['namespace_id'][0].toUpperCase();
            const imVersion = $scope.data.pds4IMVersion;
            const lddVersion = currentModel['Ingest_LDD']['ldd_version_id'][0].replace(/\./g,'');
            
            // trim any properties with empty quotes as value off of the model-
                // otherwise these would become empty XML elements
            function traverse(x) {
                if (isArray(x)) traverseArray(x);
                else if ((typeof x === 'object') && (x !== null)) traverseObject(x);
            };

            function traverseArray(arr) {
                arr.forEach(traverse);
            };

            function traverseObject(obj) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (obj[key] === "") {
                            delete obj[key];
                        };
                        traverse(obj[key]);
                    };
                };
            };

            function isArray(o) {
                return Object.prototype.toString.call(o) === '[object Array]'
            };

            traverse(currentModel);

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
        },
        showUndo: function() {
            if ($scope.data.history.length > 1 && $scope.data.historyIdx != $scope.data.history.length - 1) return true;
            else if ($scope.data.historyIdx == $scope.data.history.length - 1) return false;
            else return false;
        },
        undo: function() {
            const history = $scope.data.history;
            $scope.data.historyIdx++;
            $scope.data.timeTravel(history[$scope.data.historyIdx]);
            $scope.vis.update();
            $scope.vis.toggleHighlights();
        },
        showRedo: function() {
            if ($scope.data.historyIdx != 0) return true;
            else return false;
        },
        redo: function() {
            const history = $scope.data.history;
            $scope.data.historyIdx--;
            $scope.data.timeTravel(history[$scope.data.historyIdx]);
            $scope.vis.update();
            $scope.vis.toggleHighlights();
        },
        // exits LD3 Tool and returns user to LDD Transform page
        exit: function() {
            const root = '/';
            const userConfirm = confirm('Are you sure you want to leave this page? Any unsaved changes will be lost.');
            
            return (!userConfirm) ? null : window.location = root;
        }
    };

    // // // // // // //
    // // WATCHERS // //
    // // // // // // //

    $scope.$watch('unboundedCheckboxValue', (newVal,oldVal) => {
        if (newVal === true) $scope.newNode.maximum_occurrences = 'unbounded';
        else if (newVal === false && $scope.newNode) $scope.newNode.maximum_occurrences = '';
    });

    // // // // // // //
    // INITIALIZE D3  //
    // // // // // // //

    $scope.vis.initGrid();

    if ($scope.data.newLddMode) $scope.modal.open('editLdd');
}]);
