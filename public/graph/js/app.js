let app = angular.module('LD3', []);

app
    .directive('ld3Toolbox', () => {
        return {
            templateUrl: './partials/angular/ld3-toolbox.html'
        }
    })
    .directive('ld3Toolbar', () => {
        return {
            templateUrl: './partials/angular/ld3-toolbar.html'
        }
    })
    .directive('ld3ActiveNode', () => {
        return {
            templateUrl: './partials/angular/ld3-active-node.html',
            scope: {
                node: '='
            },
            controller: function($scope) {
                $scope.showDetails = true;
            }
        }
    })
    .directive('ld3ActiveNodeChildren', () => {
        return {
            templateUrl: './partials/angular/ld3-active-node-children.html',
            scope: {
                children: '='
            }
        }
    })
    .directive('ld3ActiveNodeParents', () => {
        return {
            templateUrl: './partials/angular/ld3-active-node-parents.html',
            scope: {
                parents: '='
            }
        }
    })
    .directive('ld3Modal', () => {
        return {
            templateUrl: './partials/angular/ld3-modal.html'
        }
    })
    .directive('ld3NodeForm', () => {
        return {
            templateUrl: './partials/angular/ld3-node-form.html'
        }
    })
    .directive('ld3NewClass', () => {
        return {
            templateUrl: './partials/angular/ld3-new-class.html'
        }
    })
    .directive('ld3NewAttribute', () => {
        return {
            templateUrl: './partials/angular/ld3-new-attribute.html'
        }
    })
