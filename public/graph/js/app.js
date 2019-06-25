let app = angular.module('LD3', ['ui.router']);

app
    .config(function($urlRouterProvider, $locationProvider, $stateProvider) {
        // catches invalid states, redirects user to root
        $urlRouterProvider.otherwise('/');
        
        // enable and configure HTML5 mode
        // anonymous config object passed into html5mode() is to prevent
        // angular uiRouter from treating anchor <a> tags as browser links
        // but instead as various uiRouter states
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
            rewriteLinks: false
        });
        
        // Defines data-type-independent states
        $stateProvider
            .state('graph', {
                url: '/',
                templateUrl: 'partials/states/graph.html',
                controller: 'ld3Controller'
            })
            .state('error', {
                url: '/error',
                template: '<div ui-view></div>'
            })
            .state('error.file', {
                url: '/file',
                templateUrl: 'partials/states/file-error.html'
            })
    })
    
    // // // DIRECTIVES // // //
    .directive('ld3Toolbar', () => {
        return {
            templateUrl: './partials/toolbar.html',
            scope: {
                dictionary: '=',
                saveLdd: '=',
                downloadLdd: '=',
                undo: '=',
                redo: '=',
                modal: '=',
                setError: '='
            },
            controller: ($scope,DataModel,$http,$rootScope) => {
                $scope.data = DataModel;
                $scope.modifyLdd = function() {
                    $scope.modal.show('editLdd');
                };
                $scope.modifyLddRules = function() {
                    $scope.modal.show('lddRules');
                };
                $scope.lddtool  = function() {
                    const currentModel = $scope.data.pureModel();
                    
                    $http.post('/ldd', {
                        filename: $scope.data.filename(),
                        string: JSON.stringify(currentModel)
                    }).then(res => {
                        window.open(`http://localhost:3002/tool/download?filename=${res.data.replace(/"/g,'')}`, '_blank');
                    }).catch(err => {
                        console.error(err);
                        const msg = 'An error occurred. If the issue persists, contact support.';
                        const trc = err;
                        $scope.setError(msg,trc);
                        $scope.modal.show('error');
                    });
                };
            }
        }
    })
    .directive('ld3ActiveNode', () => {
        return {
            templateUrl: './partials/active-node.html',
            scope: {
                activeNode: '=',
                modal: '=',
                showModal: '=',
                toggleLinkModal: '='
            },
            controller: function($scope) {
                $scope.addNewClass = function() {
                    $scope.showModal('addClass');
                };
                $scope.addNewAttribute = function() {
                    $scope.showModal('addAttribute');
                };
                $scope.modifyElement = function() {
                    if ($scope.activeNode.className === 'class') $scope.modal.show('modifyClass');
                    else $scope.modal.show('modifyAttribute');
                };
            }
        }
    })
    .directive('ld3CoreModelLink', function() {
        return {
            templateUrl: './partials/ld3-core-model-link.html',
            scope: {
                lid: '@'
            },
            controller: function($scope, $window) {
                $scope.href = function() {
                    return $window.open($scope.lid,'_blank');
                }
            }
        }
    })
    .directive('ld3ChildRow', function() {
        return {
            templateUrl: './partials/ld3-child-row.html',
            controller: function($scope, DataModel, Visualizations) {
                $scope.data = DataModel;
                $scope.vis = Visualizations;
                $scope.removeLink = function(lid /* lid of node to be removed from activeNode */) {
                    const confirmed = confirm('Are you sure you want to remove this link?');

                    if (confirmed) $scope.data.removeLink(lid);

                    $scope.vis.update();

                    return;
                };
            }
        }
    })

    // MODAL FORMS
    .directive('ld3CloseButton', () => {
        return {
            template: '<img src="./img/baseline_close_black_18dp.png" class="modal-close" ng-click="modal.hide()">'
        }
    })
    .directive('ld3EditClass', () => {
        return {
            templateUrl: './partials/ld3-edit-class.html',
            transclude: true
        }
    })
    .directive('ld3EditAttribute', () => {
        return {
            templateUrl: './partials/ld3-edit-attribute.html',
            transclude: true
        }
    })
    .directive('ld3ErrorModal', () => {
        return {
            templateUrl: 'partials/error-modal.html',
            transclude: true
        }
    })
    .directive('ld3RulesCount', () => {
        return {
            restrict: 'A',
            controller: 'RulesController',
            scope: true,
            link: function(scope, el, attrs, controller, transcludeFn) {
                el.text(`(${scope.rules.all.length})`);
            }
        }
    })