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
                modal: '='
            },
            controller: ($scope,Modal) => {
                $scope.modifyLdd = function() {
                    $scope.modal.show('editLdd');
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
                linkMode: '=',
                toggleLinkMode: '='
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
    .directive('ld3ModalCloseButton', () => {
        return {
            template: '<i class="far fa-2x fa-times-circle modal-close" ng-click="modal.hide()"></i>'
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
    });