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

app
.directive('ld3FormAddClass', () => {
    return {
        templateUrl: path.form('add-class')
    }
})
.directive('ld3FormAddAttribute', () => {
    return {
        templateUrl: path.form('add-attribute')
    }
})
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
        scope: keywordScope
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