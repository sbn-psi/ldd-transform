app.controller('LinksController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.links = {
        ancestors: [],
        elements: [],
        addLink: function(lid) {
            const e = $scope.data.getNode(lid);
            $scope.data.createLink(e);
            
            $scope.links.elements = $scope.links.elements.filter(e => e.lid !== lid);
            
            $scope.vis.update();
            $scope.vis.toggleHighlights();
        },
        removeLink: function(lid) {
            $scope.data.removeLink(lid);
            $scope.vis.update();
            $scope.vis.toggleHighlights();
        }
    };
    
    const getAncestors = function(lid) {
        const idx = $scope.data.getNode(lid,true);
        const parents = $scope.data.getParents(idx);
        if (parents.length) {
            for (let i = 0; i < parents.length; i++) {
                if ($scope.links.ancestors.indexOf(parents[i]) === -1) $scope.links.ancestors.push(parents[i]);
                getAncestors(parents[i].lid);
            }
        } else {
            return;
        }
    };
    
    const configureLinkElements = function() {
        $scope.links.ancestors = [];
        getAncestors($scope.data.activeNode.lid);
        $scope.links.elements = $scope.data.nodes.filter(node => {
            const isAncestor = x => $scope.links.ancestors.indexOf(x) !== -1;
            const isChild = x => {
                let output = false;
                $scope.data.activeNode.children.map(child => {
                    if (child.lid === x.lid) output = true;
                });
                return output;
            };
            const isActiveNode = x => $scope.data.activeNode.lid === x.lid;
            return !isAncestor(node) && !isChild(node) && !isActiveNode(node);
        });
    };
    
    $rootScope.$on('modal-show', function() {
        if ($scope.modal.type === 'addLink' || $scope.modal.type === 'removeLink') configureLinkElements();
    });
}]);