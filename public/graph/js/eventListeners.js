function addListeners() {
    $('#cancel').unbind().on('click', function() {
        event.preventDefault();
        closeModal();
    });

    $('#next').unbind().on('click', next);

    $('#save').unbind().on('click', function saveNode(event) {
        event.preventDefault();

        const missingValue = 'Value is required.';
        let formValues = [
            'namespace',
            'name',
            'version_id',
            'reference_type',
            'minimum_occurrences',
            'maximum_occurrences',
            'submitter_name',
            'definition'
        ];
        let validationErrors = {};
        let value_domain = [];
        let newNode = {
            namespace: $('#namespace').val(),
            name: $('#name').val(),
            version_id: $('#version_id').val(),
            reference_type: $('input[name="reference_type"]:checked').val(),
            minimum_occurrences: $('#minimum_occurrences').val(),
            maximum_occurrences: $('#maximum_occurrences').val(),
            submitter_name: $('#submitter_name').val(),
            definition: $('#definition').val()
        };
        
        if (newNode.reference_type == 'attribute_of') {
            const dataType = $('#value_data_type').val();
            
            formValues.push('nillable_flag');
            newNode.nillable_flag = $('input[name=nillable_flag]:checked').val();
            newNode.value_domain = {
                enumeration_flag: [$('input[name=enumeration_flag]:checked').val()],
                value_data_type: [dataType],
                unit_of_measure_type: [$('#unit_of_measure_type').val()]
            }
            formValues.push('value_domain');
            value_domain = ['enumeration_flag','value_data_type','unit_of_measure_type'];
            
            if (dataType == 'ASCII_Integer') {
                const min = $('#minimum_value').val();
                const max = $('#maximum_value').val();
                value_domain.push('minimum_value');
                if (min || min === 0) newNode.value_domain.minimum_value = [min];
                value_domain.push('maximum_value');
                if (max) newNode.value_domain.maximum_value = [max];
            }
            else if (dataType == 'ASCII_Short_String_Collapsed') {
                const min = $('#minimum_characters').val();
                const max = $('#maximum_characters').val();
                value_domain.push('minimum_characters');
                if (min || min === 0) newNode.value_domain.minimum_characters = [min];
                value_domain.push('maximum_characters');
                if (max || max === 0) newNode.value_domain.maximum_characters = [max];
            }
            
        };
        
        // now, validate
        const formIsValid = validate(newNode,formValues,value_domain);
        
        function validate(node,keywords,value_domain) {
            const errors = [];

            keywords.map(value => {
                if (value == 'value_domain') {
                    value_domain.map(key => {
                        $(`label[for="${key}"]`).removeClass('error');
                    });
                }
                $(`label[for="${value}"]`).removeClass('error');
                if (!node[value]) errors.push(value);
            });

            if (node.reference_type == 'attribute_of') {
                value_domain.map(value => {
                    if (!node['value_domain'][value] || !node['value_domain'][value][0]) {
                        errors.push(value);
                    }
                    else if (value == 'value_data_type' && value_domain[value] == 'ASCII_Integer') {
                        // validate minimum_value
                        if (!value_domain[value]['minimum_value']) errors.push('minimum_value');
                        // validate maxnimum_value
                        if (!value_domain[value]['maximum_value']) errors.push('maximum_value');
                    } else if (value == 'value_data_type' && value_domain[value] == 'ASCII_Short_String_Collapsed') {
                        // validate minimum_characters
                        if (!value_domain[value]['minimum_characters']) errors.push('minimum_characters');
                        // validate maximum_characters
                        if (!value_domain[value]['maximum_characters']) errors.push('maximum_characters');
                    }
                });
            };

            errors.map(key => {
                $(`label[for="${key}"]`).addClass('error');
            });

            if (errors.length) return false;
            else return true;
        };
        
        if (formIsValid === true) {
            // metadata has been collected from user:
            newNode.identifier_reference = newNode.namespace + '.' + newNode.name;
            // update model and d3
            data.addNode(newNode);
            toggleNodes();
            // close modal
            closeModal();
        };
    });
    
    $('#create-node').unbind().on('click', function() {
        newModal('node');
    });
    
    $('#create-link').unbind().on('click', data.linkMode);
    
    $('#startover').unbind().on('click', function() {
        let _confirm = confirm('Are you sure you want to start over? All of your changes will be lost.');
        
        if (_confirm) return startOver();
        else return;
        
        function startOver() {
            localStorage.removeItem('ld3');
            loadFile();
        };
    });
    
    //////// EDIT LDD FORM ////////
    
    $('#editldd').unbind().on('click', function() {
        newModal('ldd');
    });
    $('#edit-ldd-save').unbind().on('click', function(event) {
        event.preventDefault();
        var values = {};
        
        $.each($('#editlddform').serializeArray(), function(i, field) {
            values[field.name] = field.value;
        });
        
        data.modifyLddDetails(values);
        
        updateToolbar(null);
        
        closeModal();
    });
    
    $('.decline').unbind().on('click', function(event) {
        event.preventDefault();
        closeModal();
    });
    
    $('#show-and-hide').hide();
    $('#toggle-ldd-details').unbind().on('click', function() {
        const current = $(this).text();
        
        // show or hide
        if (/Show/.test(current)) {
            $("#show-and-hide").fadeIn();
            $(this).text('Hide Details');
        } else if (/Hide/.test(current)) {
            $('#show-and-hide').fadeOut();
            $(this).text('Show Details');
        } else {
            throw new Error('unexpected text');
        }
    });
    
    $('#legend-toggle').unbind().on('click', function() {
        const current = $(this).text();
        if (current == 'Hide') {
            $('#legend').fadeOut();
            $(this).text('Show');
        } else if (current == 'Show') {
            $('#legend').fadeIn();
            $(this).text('Hide');
        } else {
            throw new Error('unexpected text input');
        }
    });
    
    //////// EDIT NODE FORM ////////
    
    $('#editnode').unbind().on('click', function() {
        newModal('editnode');
    });
    $('#toggle-node-details').unbind().on('click', function(event) {
        event.preventDefault();
        const current = $(this).text();
        
        if (/Show/.test(current)) {
            $('.node-details').fadeIn();
            $(this).text('Hide Details');
        } else if (/Hide/.test(current)) {
            $('.node-details').fadeOut();
            $(this).text('Show Details');
        } else {
            throw new Error('unexpected text input');
        };
    });
    $('#editnode-save').unbind().on('click', function(event) {
        event.preventDefault();
        
        var values = {
            'name': $('#name-editnode').val(),
            'local_identifier': $('#identifier_reference-editnode').val(),
            'version_id': $('#version_id-editnode').val(),
            'definition': $('#definition-editnode').val(),
            'submitter_name': $('#submitter_name-editnode').val()
        };
        
        if (activeNode.className == 'attribute') {
            // do attribute stuff to values
            values['value_domain'] = {
                'DD_Permissible_Value': [],
                'enumeration_flag': [$('input[name="enumeration_flag"]:checked').val()],
                'unit_of_measure_type': [$('#unit_of_measure_type-editnode').val()],
                'value_data_type': [$('#value_data_type-editnode').val()]
            };
            var dataType = $('#value_data_type-editnode').val();
            
            if (dataType == 'ASCII_Integer') {
                // if (min) add min to value_domain
                var min = $('#minimum_value').val();
                if (min) {
                    values['value_domain']['minimum_value'] = [min];
                }
                
                // if (max) add max to value_domain
                var max = $('#maximum_value').val();
                if (max) {
                    values['value_domain']['maximum_value'] = [max];
                }
            } else if (dataType == 'ASCII_Short_String_Collapsed') {
                values['value_domain'] = {
                    'enumeration_flag': [$('input[name="enumeration_flag"]:checked').val()],
                    'unit_of_measure_type': [$('#unit_of_measure_type-editnode').val()],
                    'value_data_type': []
                };
            } else if (dataType == 'ASCII_Short_String_Collapsed' && $('input[name="enumeration_flag"]:checked').val() == true) {
                values['value_domain']['DD_Permissible_Value'] = [];
                $.each($('input[name="value"]'), function(index, value) {
                    values['value_domain']['DD_Permissible_Value'][index] = {
                        value: [$(value).val()],
                        value_meaning: null
                    };
                });
                $.each($('textarea[name="value_meaning"]'), function(index, value_meaning) {
                    values['value_domain']['DD_Permissible_Value'][index]['value_meaning'] = [$(value_meaning).val()];
                });
                values['value_domain']['DD_Permissible_Value'] = values['value_domain']['DD_Permissible_Value'].filter(v => {
                    if (!v.value[0] && !v.value_meaning[0]) return false;
                    else return true;
                });
            } else {
                console.error('unexpected data type');
            }
        };
        
        data.modifyNode(activeNode.lid, values);
        
        updateToolbar();
        
        closeModal();
    });
    
    $('.active-child-clickable').unbind().on('click', function(event) {
        event.preventDefault();
        var lid = $(event.target).text();
        var nodeIdx = data.getNode(lid,true);
        
        update();
        
        toggleNodes(data.nodes[nodeIdx]);
        
        updateToolbar();
    });
    
    // add event listeners to trash icons now that they exist in DOM
    $('.fa-unlink').unbind().on('click',function(event) {
        let target = event.target;
        let _confirm = confirm('Are you sure you want to remove this link?');

        if (_confirm) {
            const deleteLid = $(target).parent().attr('data-node-name');
            data.deleteNode(deleteLid);
            toggleNodes();
        } else {
            return;
        }
    });

    $('#download').unbind().on('click',function() {
        var currentModel = data.pureModel();
        var dateTime = currentModel['Ingest_LDD']['last_modification_date_time'][0];
        
        $.ajax({
            type: 'POST',
            url: '../json/to/xml',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(currentModel),
            success: function(res) {
                var blob = new Blob([res], {type: "text/xml;charset=utf-8"});
                saveAs(blob,`ldd.out.${dateTime}.xml`);
                data.defineNodesAndLinks();
            }
        });
    });
};