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
            templateUrl: './partials/ld3-edit-node-form.html'
        }
    })
    .directive('ld3EditClass', () => {
        return {
            templateUrl: './partials/ld3-edit-class.html',
            controller: function($scope) {
            }
        }
    })
    .directive('ld3EditAttribute', () => {
        return {
            templateUrl: './partials/ld3-edit-attribute.html'
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
    })
