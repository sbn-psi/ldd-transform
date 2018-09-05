function addListeners() {
    return console.log('addListeners has been disabled');

    //////// EDIT LDD FORM ////////

    $('#edit-ldd-save').unbind().on('click', function(event) {
        event.preventDefault();
        var values = {};

        $.each($('#editlddform').serializeArray(), function(i, field) {
            values[field.name] = field.value;
        });

        data.modifyLddDetails(values);

        closeModal();
    });

    //////// EDIT NODE FORM ////////

    $('#editnode').unbind().on('click', function() {
        newModal('editnode');
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

        closeModal();
    });

    $('.active-child-clickable').unbind().on('click', function(event) {
        event.preventDefault();
        var lid = $(event.target).text();
        var nodeIdx = data.getNode(lid,true);

        update();

        toggleNodes(data.nodes[nodeIdx]);
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
};
