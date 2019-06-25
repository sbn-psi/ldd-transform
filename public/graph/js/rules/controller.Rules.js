app.controller('RulesController', ['$scope', 'DataModel', 'DDRules', function($scope, DataModel, DDRules) {
    $scope.rules = DDRules;
    const model = DataModel.model['Ingest_LDD'];
    (model['DD_Rule'] && model['DD_Rule'].length) ? $scope.rules.set(model['DD_Rule']) : $scope.rules.set([]);
}]);