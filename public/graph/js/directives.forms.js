const path = {
    form: (p) => {
        return `./partials/forms/${p}.html`;
    },
    input: (p) => {
        return `./partials/forms/inputs/${p}.html`;
    }
};

const keywordScope = {
    pds4Keyword: '=',
    error: '='
};

const lddScope = {
    ld3Keyword: '=',
    error: '='
};

const errorsExist = function(errObj) {
    const keys = Object.keys(errObj);
    
    for (let i = 0; i < keys.length; i++) {
        if (errObj[keys[i]].length > 0) return true;
    }
    
    return false;
}

app
// // // FORMS // // //
.directive('ld3FormAddClass', (Validate) => {
    return {
        templateUrl: path.form('add-class'),
        scope: true,
        controller: function($scope) {
            $scope.form = {
                addClass: function() {
                    const formValues = $scope.newNode;
                    
                    $scope.errors = Validate.classForm(formValues);
                    if (errorsExist($scope.errors)) return;
                    
                    $scope.newNode.local_identifier = `${$scope.newNode.namespace_id}.${$scope.newNode.name}`;
                    $scope.data.addClass($scope.newNode);
                    
                    $scope.vis.update();
                    $scope.modal.hide();
                    
                    return $scope.newNode = {};
                }
            };
        }
    }
})
.directive('ld3FormAddAttribute', (Validate) => {
    return {
        templateUrl: path.form('add-attribute'),
        scope: true,
        controller: function($scope) {
            $scope.form = {
                addAttribute: function() {
                    const formValues = $scope.newNode;
                    
                    $scope.errors = Validate.attributeForm(formValues);
                    if (errorsExist($scope.errors)) return;
                    
                    $scope.newNode.local_identifier = `${$scope.newNode.namespace_id}.${$scope.newNode.name}`;
                    $scope.data.addAttribute($scope.newNode);
                    
                    $scope.vis.update();
                    $scope.modal.hide();
                    
                    return $scope.newNode = {};
                }
            };
        }
    }
})

// // // INPUTS // // //
.directive('pds4ClassName', () => {
    return {
        templateUrl: path.input('pds4-class-name'),
        scope: keywordScope
    }
})
.directive('pds4AttributeName', () => {
    return {
        templateUrl: path.input('pds4-attribute-name'),
        scope: keywordScope
    }
})
.directive('pds4Namespace', () => {
    return {
        templateUrl: path.input('pds4-namespace'),
        scope: keywordScope
    }
})
.directive('pds4Version', () => {
    return {
        templateUrl: path.input('pds4-version'),
        scope: keywordScope
    }
})
.directive('pds4SubmitterName', () => {
    return {
        templateUrl: path.input('pds4-submitter-name'),
        scope: keywordScope
    }
})
.directive('pds4Definition', () => {
    return {
        templateUrl: path.input('pds4-definition'),
        scope: keywordScope
    }
})
.directive('pds4MinOcc', () => {
    return {
        templateUrl: path.input('pds4-minimum-occurrences'),
        scope: keywordScope
    }
})
.directive('pds4MaxOcc', () => {
    return {
        templateUrl: path.input('pds4-maximum-occurrences'),
        scope: keywordScope,
        controller: function($scope) {
            $scope.$watch('unboundedCheckboxValue', (newVal,oldVal) => {
                if (newVal === true) $scope.pds4Keyword = 'unbounded';
            })
        }
    }
})
.directive('pds4NillableFlag', () => {
    return {
        templateUrl: path.input('pds4-nillable-flag'),
        scope: keywordScope
    }
})
.directive('pds4EnumerationFlag', () => {
    return {
        templateUrl: path.input('pds4-enumeration-flag'),
        scope: keywordScope
    }
})
.directive('pds4PermissibleValues', () => {
    return {
        templateUrl: path.input('pds4-permissible-values'),
        scope: {
            permissibleValues: '=',
            error: '='
        },
        controller: function($scope) {
            const newline = function() {
                return {value: '',value_meaning: ''};
            };
            
            $scope.addLine = function() {
                $scope.permissibleValues.push(newline());
            };
            $scope.removeLine = idx => {
                if ($scope.permissibleValues.length === 1) {
                    $scope.permissibleValues = [newline()];
                    return $scope.error = 'At least one permissible value is required if the enumaration flag is `true`.';
                } else {
                    $scope.permissibleValues.shift(idx,1);
                }
            };
        }
    }
})
.directive('pds4DataType', () => {
    return {
        templateUrl: path.input('pds4-data-type'),
        scope: keywordScope
    }
})
.directive('pds4UnitType', () => {
    return {
        templateUrl: path.input('pds4-unit-type'),
        scope: keywordScope
    }
})

// Modify LDD Details Form
.directive('ld3FormModifyLddDetails', () => {
    return {
        templateUrl: path.form('modify-ldd-details')
    }
})
// Modify Elements
.directive('ld3FormModifyClass', () => {
    return {
        templateUrl: path.form('modify-class'),
        scope: {
            activeNode: '=',
            modal: '='
        },
        controller: function($scope, $rootScope, DataModel, Visualizations) {
            $scope.vis = Visualizations;
            $scope.data = DataModel;
            
            $rootScope.$on('modal-show',function() {
                $scope.modifiedNode = JSON.parse(JSON.stringify($scope.data.activeNode));
                $scope.modifiedNode.namespace_id = [$scope.modifiedNode['lid'].split('.')[0]];
            });
            
            $scope.modifyClass = function() {
                const lid = $scope.data.activeNode.lid;
                const values = {
                    name: $scope.modifiedNode['name'][0],
                    version_id: $scope.modifiedNode['version_id'][0],
                    local_identifier: $scope.modifiedNode['namespace_id'][0] + '.' + $scope.modifiedNode['name'][0],
                    submitter_name: $scope.modifiedNode['submitter_name'][0],
                    definition: $scope.modifiedNode['definition'][0]
                };

                $scope.data.modifyClass(lid,values);

                $scope.vis.update();

                $scope.modal.hide();
            };
        }
    }
})
.directive('ld3FormModifyAttribute', () => {
    return {
        templateUrl: path.form('modify-attribute'),
        controller: function($scope, $rootScope, DataModel, Visualizations) {
            $scope.vis = Visualizations;
            $scope.data = DataModel;
            
            $rootScope.$on('modal-show',function() {
                if (!$scope.data && !$scope.data.activeNode) return;
                $scope.modifiedNode = JSON.parse(JSON.stringify($scope.data.activeNode));
                $scope.modifiedNode.namespace_id = [$scope.modifiedNode['lid'].split('.')[0]];
            });
            
            $scope.modifyAttribute = function() {
                const lid = $scope.data.activeNode.lid;
                const values = {
                    name: $scope.modifiedNode['name'][0],
                    version_id: $scope.modifiedNode['version_id'][0],
                    local_identifier: $scope.modifiedNode['namespace_id'][0] + '.' + $scope.modifiedNode['name'][0],
                    nillable_flag: $scope.modifiedNode['nillable_flag'][0],
                    submitter_name: $scope.modifiedNode['submitter_name'][0],
                    definition: $scope.modifiedNode['definition'][0],
                };

                $scope.data.modifyAttribute(lid,values);

                $scope.vis.update();

                $scope.modal.hide();
            };
        }
    }
})