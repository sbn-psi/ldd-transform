app.controller('ld3Controller', ['$scope', '$window', 'DataModel', 'Modal', 'Visualizations', '$rootScope', 'Validate', 'ErrorHandler',
    function($scope, $window, DataModel, Modal, Visualizations, $rootScope, Validate, ErrorHandler) {
        // initialize application state
        $rootScope.$on('modal-show', function() {
            const newNode = (() => {
                // default form values
                return {
                    unit_of_measure_type: 'Units_of_None',
                    value_data_type: 'ASCII_Real',
                    version_id: '1.0',
                    minimum_occurrences: 0,
                    namespace_id: $scope.ldd.original.namespace_id,
                    submitter_name: $scope.ldd.original.full_name,
                    nillable_flag: false,
                    enumeration_flag: false,
                    permissibleValues: [{
                        value: '',
                        value_meaning: ''
                    }]
                };
            })();
            if ($scope.modal.type == 'addAttribute') $scope.newNode = newNode;
            if ($scope.modal.type == 'addClass') $scope.newNode = newNode;
        });
        
        const errorHandler = ErrorHandler;
        $scope.error = errorHandler.get();

        $scope.modal = Modal;
        $scope.vis = Visualizations;
        $scope.data = DataModel;
        $scope.ldd = $scope.data.ldd();
        $scope.form = {
            addClass: function() {
                const formValues = $scope.newNode;

                $scope.errors = Validate.classForm(formValues);
                if (errorsExist($scope.errors)) return;

                $scope.newNode.local_identifier = `${$scope.newNode.namespace_id}.${$scope.newNode.name}`;
                $scope.data.addClass($scope.newNode);

                $scope.vis.update();
                $scope.modal.hide();

                return $scope.newNode = {};
            },
            addAttribute: function() {
                const formValues = $scope.newNode;

                $scope.errors = Validate.attributeForm(formValues);
                if (errorsExist($scope.errors)) return;

                $scope.newNode.local_identifier = `${$scope.newNode.namespace_id}.${$scope.newNode.name}`;
                $scope.data.addAttribute($scope.newNode);

                $scope.vis.update();
                $scope.modal.hide();

                return $scope.newNode = {};
            }
        };
        $scope.ld3 = {
            isVisible: {
                legend: true,
                lddDetails: false,
                activeNodeDetails: false,
            },
            isEnabled: {
                addNode: function() {
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
            toggleLinkModal: function(type) {
                $scope.modal.show(type);
            },
            openAddNodeModal: function(modalName) {
                $scope.modal.show(modalName);
                $scope.errors = {};
            },
            editLdd: function() {
                $scope.modal.show('editLdd');
                $scope.errors = {};
                return;
            },
            saveLdd: function() {
                $scope.errors = Validate.lddForm($scope.ldd.edit);
                if (errorsExist($scope.errors)) return;

                $scope.modal.hide();
                $scope.data.modifyLddDetails($scope.ldd.edit);
                $scope.ldd = $scope.data.ldd();

                if ($scope.data.newLddMode) {
                    $scope.errors = {};
                    $scope.modal.show('addClass');
                };
            },
            download: function() {
                const currentModel = $scope.data.pureModel();
                const filename = $scope.data.filename();
                
                $.ajax({
                    type: 'POST',
                    url: '../json/to/xml',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify(currentModel),
                    success: function(res) {
                        const blob = new Blob([res], {
                            type: "text/xml;charset=utf-8"
                        });
                        saveAs(blob, filename);
                    }
                });
            },
            undo: {
                show: function() {
                    if ($scope.data.history.length > 1 && $scope.data.historyIdx != $scope.data.history.length - 1) return true;
                    else if ($scope.data.historyIdx == $scope.data.history.length - 1) return false;
                    else return false;
                },
                do: function() {
                    const history = $scope.data.history;
                    $scope.data.historyIdx++;
                    $scope.data.timeTravel(history[$scope.data.historyIdx]);
                    $scope.vis.update();
                    $scope.vis.toggleHighlights();
                }
            },
            redo: {
                show: function() {
                    if ($scope.data.historyIdx != 0) return true;
                    else return false;
                },
                do: function() {
                    const history = $scope.data.history;
                    $scope.data.historyIdx--;
                    $scope.data.timeTravel(history[$scope.data.historyIdx]);
                    $scope.vis.update();
                    $scope.vis.toggleHighlights();
                }
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

        $scope.$watch('unboundedCheckboxValue', (newVal, oldVal) => {
            if (newVal === true) $scope.newNode.maximum_occurrences = 'unbounded';
            else if (newVal === false && $scope.newNode) $scope.newNode.maximum_occurrences = '';
        });

        $rootScope.$on('new-error', function() {
            $scope.error = errorHandler.get();
        });

        // // // // // // //
        // INITIALIZE D3  //
        // // // // // // //

        $scope.vis.initGrid();

        if ($scope.data.newLddMode) $scope.modal.show('editLdd');
    }
]);