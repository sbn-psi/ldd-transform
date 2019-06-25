app.controller('RulesController', ['$scope', '$rootScope', 'Modal', 'DataModel', function($scope, $rootScope, Modal, DataModel) {
    $rootScope.$on('modal-show', modalSetup);
    $rootScope.$on('modal-hide', modalTeardown)
    
    function modalSetup() {
        if (Modal.type !== 'lddRules') return;
        
        const model = DataModel.model['Ingest_LDD'];
        
        return (model['DD_Rule'] && model['DD_Rule'].length) ? $scope.rules = model['DD_Rule'] : $scope.rules = [];
    };
    
    function modalTeardown() {
        $scope.rules = null;
        $scope.activeRule = null;
    };
    
    function ActiveRule() {
        this.rule = null;
        
        this.set = function(rule) {
            // takes a fully parameterized rule object
            // and flattens it for use with a simple form
            this.rule = new DD_Rule(rule);
            return;
        };
        
        this.get = function() {
            return this.rule;
        };
        
        this.isActive = rule => (!$scope.activeRule || !$scope.activeRule.rule || !rule) ? false : rule.local_identifier === $scope.activeRule.rule.local_identifier;
    };
    
    $scope.activeRule = new ActiveRule();
}])