let app = angular.module('LD3', []);

app.controller('ld3Controller', ['$scope', function($scope) {
    // initialize application state
    $scope.ld3 = {
        legendIsVisible: true,
    };
}]);

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
    .directive('ld3Modal', () => {
        return {
            templateUrl: './partials/angular/ld3-modal.html'
        }
    })
