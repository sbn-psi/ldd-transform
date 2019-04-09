app.factory('Validate', function() {
    const validations = {
        name: function(name) {
            let message = '';
            
            if (!name) {
                message = 'Name is required.';
            } else if (name.match(/ /g)) {
                message = 'Spaces are not allowed. Replace spaces with underscores.';
            }
            
            return message;
        },
        namespace_id: function(ns) {
            let message = '';
            
            if (!ns) message = 'Namespace ID is required.';
            
            return message;
        },
        version_id: function(vid) {
            let message = '';
            
            if (!vid) message = 'Version is required.';
            
            return message;
        },
        submitter_name: function(sname) {
            let message = '';
            
            if (!sname) message = 'Submitter name is required.';
            
            return message;
        },
        definition: function(def) {
            let message = '';
            
            if (!def) message = 'Definition is required.';
            
            return message;
        },
        minimum_occurrences: function(minocc) {
            let message = '';
            
            if (!minocc && minocc != 0) message = 'Minimum occurrences is required.';
            
            return message;
        },
        maximum_occurrences: function(maxocc) {
            let message = '';
            
            if (!maxocc && maxocc != 0) message = 'Maximum occurrences is required.';
            
            return message;
        },
        nillable_flag: function(nflag) {
            let message = '';
            
            if (nflag === undefined) message = 'Nillable flag is required.';
            
            return message;
        },
        enumeration_flag: function(eflag) {
            let message = '';
            
            if (eflag === undefined) message = 'Enumeration flag is required.';
            
            return message;
        }
    };
    
    const elements = {
        attribute: [
            'name',
            'namespace_id',
            'version_id',
            'submitter_name',
            'definition',
            'minimum_occurrences',
            'maximum_occurrences',
            'nillable_flag',
            'enumeration_flag',
            'value_data_type',
            'unit_of_measure_type'
        ],
        class: [
            'name',
            'namespace_id',
            'version_id',
            'submitter_name',
            'definition',
            'minimum_occurrences',
            'maximum_occurrences'
        ]
    };
    
    const validate = {
        attributeForm: function(formValues) {
            let output = {};
            
            elements.attribute
                .map(attr => {
                    if (validations[attr]) output[attr] = validations[attr](formValues[attr]);
                });
            
            return output;
        },
        classForm: function(formValues) {
            let output = {};
            
            elements.class
                .map(attr => {
                    if (validations[attr]) output[attr] = validations[attr](formValues[attr]);
                });
            
            return output;
        }
    };

    return validate;
});
