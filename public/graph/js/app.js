let app = angular.module('LD3', []);

app
    .directive('ld3Toolbox', () => {
        return {
            templateUrl: './partials/ld3-toolbox.html'
        }
    })
    .directive('ld3Menubar', () => {
        return {
            templateUrl: './partials/ld3-menubar.html'
        }
    })
    .directive('ld3ActiveNode', () => {
        return {
            templateUrl: './partials/ld3-active-node.html'
        }
    })
    .directive('ld3ActiveNodeChildren', () => {
        return {
            templateUrl: './partials/ld3-active-node-children.html'
        }
    })
    .directive('ld3ActiveNodeParents', () => {
        return {
            templateUrl: './partials/ld3-active-node-parents.html',
            scope: {
                parents: '='
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
    .directive('ld3Modal', () => {
        return {
            templateUrl: './partials/ld3-modal.html'
        }
    })
    .directive('ld3ModalCloseButton', () => {
        return {
            template: '<i class="far fa-2x fa-times-circle modal-close" ng-click="modal.close()"></i>'
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


    .directive('ld3NewClass', () => {
        return {
            templateUrl: './partials/ld3-new-class.html'
        }
    })
    .directive('ld3NewAttribute', () => {
        return {
            templateUrl: './partials/ld3-new-attribute.html'
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
