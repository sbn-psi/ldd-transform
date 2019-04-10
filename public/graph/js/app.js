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
                dictionary: '='
            }
        }
    })
    .directive('ld3ActiveNode', () => {
        return {
            templateUrl: './partials/active-node.html',
            scope: {
                activeNode: '=',
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


    // MODAL FORMS
    .directive('ld3ModalCloseButton', () => {
        return {
            template: '<i class="far fa-2x fa-times-circle modal-close" ng-click="modal.hide()"></i>'
        }
    })
    .directive('ld3NodeForm', () => {
        return {
            templateUrl: './partials/ld3-node-form.html'
        }
    })
    .directive('ld3EditNodeForm', () => {
        return {
            templateUrl: './partials/ld3-edit-node-form.html',
            transclude: true
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
    .directive('ld3EditLddForm', () => {
        return {
            templateUrl: './partials/ld3-edit-ldd-form.html'
        }
    })

    .directive('ld3NewElement', () => {
        return {
            templateUrl: './partials/modal.new-element.html'
        }
    });

app.filter('classes', function() {
        return function(input) {
            if (!input) return null;
            const output = input.filter(elem => {
                if (!elem['reference_type']) return elem['local_identifier'][0] == 'component_of';
                else return elem['reference_type'][0] == 'component_of';
            });
            return output;
        };
    })
    .filter('attributes', function() {
        return function(input) {
            if (!input) return null;
            const output = input.filter(elem => {
                if (!elem['reference_type']) return elem['local_identifier'][0] == 'attribute_of';
                else return elem['reference_type'][0] == 'attribute_of';
            });
            return output;
        };
    })
