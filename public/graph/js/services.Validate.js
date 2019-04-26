app.factory('Validate', function() {
    const validator = test => message => value => test(value) ? message : '';
    const isNull = x => !x && x !== 0;
    const isUndefined = x => x === undefined;
    const hasWhitespace = x => / /g.test(x);
    const lddVersionFormat = x => /[0-9].[0-9].[0-9].[0-9]/g.test(x) === false;
    
    const validations = {
        comment: validator(isNull)('Comment is required.'),
        definition: validator(isNull)('Definition is required.'),
        enumeration_flag: validator(isUndefined)('Enumeration flag is required.'),
        full_name: validator(isNull)('Full name is required.'),
        ldd_version_id: validator(lddVersionFormat)('LDD Version must be of the form \'(1.2.3.4)\''),
        maximum_occurrences: validator(isNull)('Maximum occurrences is required.'),
        maximum_value: validator(isNull)('Maximum value is required'),
        minimum_occurrences: validator(isNull)('Minimum occurrences is required.'),
        minimum_value: validator(isNull)('Miniumum value is required'),
        name: validator(isNull)('Name is required'),
        namespace_id: validator(isNull)('Namespace is required.'),
        nillable_flag: validator(isUndefined)('Nillable flag is required.'),
        steward_id: validator(isNull)('Steward ID is required.')
    };
    
    const forms = {
        attributeForm: [
            'name',
            'namespace_id',
            'version_id',
            'submitter_name',
            'definition',
            'minimum_occurrences',
            'maximum_occurrences',
            'minimum_value',
            'maximum_value',
            'nillable_flag',
            'enumeration_flag',
            'value_data_type',
            'unit_of_measure_type'
        ],
        classForm: [
            'name',
            'namespace_id',
            'version_id',
            'submitter_name',
            'definition',
            'minimum_occurrences',
            'maximum_occurrences'
        ],
        lddForm: [
            'name',
            'ldd_version_id',
            'full_name',
            'steward_id',
            'namespace_id',
            'comment'
        ]
    };
    
    const validate = {
        attributeForm: function(formValues) {
            let output = {};
            
            forms.attributeForm
                .map(attr => {
                    if (validations[attr]) output[attr] = validations[attr](formValues[attr]);
                });
            
            return output;
        },
        classForm: function(formValues) {
            let output = {};
            
            forms.classForm
                .map(attr => {
                    if (validations[attr]) output[attr] = validations[attr](formValues[attr]);
                });
            
            return output;
        },
        lddForm: function(formValues) {
            let output = {};
            
            forms.lddForm
                .map(keyword => {
                    if (validations[keyword]) output[keyword] = validations[keyword](formValues[keyword]);
                });
            
            return output;
        }
    };
    
    return validate;
});
