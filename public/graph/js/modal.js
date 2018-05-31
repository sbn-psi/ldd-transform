var modal = null;
var newNode = {};

function newModal(type) {
    switch (type) {
        // new node modal
        case 'node':
            // reset newNode
            newNode = {};

            modal = new Custombox.modal({
                content: {
                    effect: 'slide',
                    id: 'addnode',
                    target: '#ld3-modal',
                    onOpen: createNodeModal
                }
            });
            break;
        case 'ldd':
            // edit ldd details modal
            modal = new Custombox.modal({
                content: {
                    effect: 'slide',
                    id: 'editldd',
                    target: '#ld3-modal',
                    onOpen: editLddModal
                }
            });
            break;
        case 'editnode':
            // edit node
            modal = new Custombox.modal({
                content: {
                    effect: 'slide',
                    id: 'editnode',
                    target: '#ld3-modal',
                    onOpen: editNodeModal
                }
            });
            break;
        default:
            throw new Error('no modal type provided');
    }

    modal.open();
};

function editNodeModal() {
    $('#ld3-modal').empty();
    
    // only nodes in LDD namespace can be modified
    if (activeNode.lid.indexOf('.') != -1 && activeNode.lid.split('.')[0] != data.model['Ingest_LDD']['namespace_id']) {

        $('#ld3-modal').load('./partials/error.modal.html', function() {
            $("#errorModalMessage").text(`Only elements that belong to the LDD namespace ("${data.model['Ingest_LDD']['namespace_id']}") can be modified.`);
            addListeners();
        });

    } else {

        $('#ld3-modal').load('./partials/node.edit.html', function() {

            $('#version_id-editnode').val(activeNode.version_id[0]).focus();
            
            $('#identifier_reference-editnode').val(function() {
                if (activeNode.lid.indexOf('.') == -1 || activeNode.lid == 'Click to Edit') {
                    enableInput('identifier_reference-editnode');
                    return activeNode.lid;
                } else {
                    try {
                        var output = activeNode.identifier_reference[0];
                        if (activeNode.identifier_reference.join('') == "") enableInput('identifier_reference-editnode');
                        return output;
                    } catch (err) {
                        var output = activeNode.local_identifier[0];
                        if (activeNode.local_identifier.join('') == "") enableInput('identifier_reference-editnode');
                        return output;
                    }
                };
            });

            $('#name-editnode').val(function() {
                if (activeNode.name.join('') == "" || activeNode.name == 'Click to Edit') enableInput('name-editnode')
                return activeNode.name[0];
            });

            $('#definition-editnode').val(activeNode.definition[0]);

            $('#submitter_name-editnode').val(activeNode.submitter_name[0]);
            
            if (!activeNode['DD_Value_Domain']) {
                $(`label[for="enumeration_flag"]`).remove();
                $(`label[for="value_data_type-editnode"]`).remove();
                $(`label[for="unit_of_measure_type-editnode"]`).remove();
            } else {
                var dataType = activeNode['DD_Value_Domain'][0]['value_data_type'][0];
                $(`.value_data_type_option[value="${dataType}"]`).prop('selected',true);
                
                var enumerationFlag = activeNode['DD_Value_Domain'][0]['enumeration_flag'][0];
                $(`#enumeration_flag-${enumerationFlag}`).prop('checked',true);
                console.log(dataType);
                toggleForm(dataType,'editnodeform');
                
                // add listeners
                $('select').on('click', function() {
                    dataType = $('.value_data_type').val();
                    toggleForm(dataType,'editnodeform');
                });
                
                
                
            };
            addListeners();
        });
    }
};

function toggleForm(dataType,formName) {
    $('label[for="minimum_value"]').remove();
    $('label[for="maximum_value"]').remove();
    $(`label[for="minimum_characters"]`).remove();
    $('label[for="maximum_characters"]').remove();
    
    
    switch (dataType) {
        case 'ASCII_Integer':
            $.get('./partials/node.edit.integer.html', function(html) {
                
                $(`#${formName}`).append(html);
                
                if (activeNode['DD_Value_Domain'][0]['minimum_value']) { // fill min value 
                    // console.log('min',);
                    $('#minimum_value').val(activeNode['DD_Value_Domain'][0]['minimum_value'][0]);
                }
                
                if (activeNode['DD_Value_Domain'][0]['maximum_value']) { // fill min value 
                    // console.log('max',);
                    $('#maximum_value').val(activeNode['DD_Value_Domain'][0]['maximum_value'][0]);
                }
                
            });
            break;
        case 'ASCII_Short_String_Collapsed':
            var ef = $('input[name="enumeration_flag"]:checked').val() != 'false';
            
            if (ef) {
                $.get('./partials/node.edit.string.2.html', function(template) {
                    $.get('./partials/node.edit.string.1.html', function(string1) {
                        $(`#${formName}`).append(string1);
                        
                        activeNode['DD_Value_Domain'][0]['DD_Permissible_Value'].map((v,idx) => {
                            let html = template;
                            html = html.replace(`id="value"`,`id="value-${idx}"`);
                            html = html.replace(`id="value_meaning"`,`id="value_meaning-${idx}"`);
                            $(`#${formName}`).append(html);
                            $(`#value-${idx}`).val(v['value'][0]);
                            $(`#value_meaning-${idx}`).val(v['value_meaning'][0]);
                        });
                    })
                    
                    // TODO append add new value button
                })
            } else {
                $.get('./partials/node.edit.string.1.html', function(html) {
                    $(`#${formName}`).append(html);
                });
            }
            
            break;
        default:
            throw new Error('unexpected data type');
    }
};

function enableInput(id) {
    $(`#${id}`).prop('disabled', false).focus();
};

function editLddModal() {
    $('#ld3-modal').empty();

    $('#ld3-modal').load('./partials/ldd.edit.html', function() {

        $('#name').val(data.model['Ingest_LDD']['name'][0]);
        $('#ldd_version_id').val(data.model['Ingest_LDD']['ldd_version_id'][0]);
        $('#full_name').val(data.model['Ingest_LDD']['full_name'][0]);
        $('#steward_id').val(data.model['Ingest_LDD']['steward_id'][0]);
        $('#namespace_id').val(data.model['Ingest_LDD']['namespace_id'][0]);
        $('#comment').val(data.model['Ingest_LDD']['comment'][0]);
        $('#pds4_im_version').val(data.pds4IMVersion);


        addListeners();
    });
};

function createNodeModal() {
    $('#ld3-modal').empty();

    $('#ld3-modal').load('./partials/create.1.html', addListeners);
};

var i_r;
var r_t;
var min;
var max;
var name;
var v_id;
var s_n;
var def;
var n_f;

function next() {
    // TODO form validation

    i_r = document.getElementById('identifier_reference').value;
    r_t = document.getElementById('reference_type').value;
    min = document.getElementById('minimum_occurrences').value;
    max = document.getElementById('maximum_occurrences').value;

    newNode.identifier_reference = i_r;
    newNode.lid = i_r;
    newNode.reference_type = r_t;
    newNode.minimum_occurrences = min;
    newNode.maximum_occurrences = max;

    $('#ld3-modal').empty();

    if (r_t == 'component_of') $('#ld3-modal').load('./partials/create.2.class.html', placeholder);
    else if (r_t == 'attribute_of') $('#ld3-modal').load('./partials/create.2.attribute.html', placeholder);

    function placeholder() {
        $('#submitter_name').val(data.model['Ingest_LDD']['full_name'][0]);

        addListeners();
        // add listeners
        $('select').on('click', function() {
            dataType = $('.value_data_type').val();
            toggleForm(dataType,'create-new-node');
        });
    }
};

function saveNode() {
    newNode.name = document.getElementById('name').value;
    newNode.version_id = document.getElementById('version_id').value;
    newNode.submitter_name = document.getElementById('submitter_name').value;
    newNode.definition = document.getElementById('definition').value;
    if (r_t == 'attribute_of') {
        let dt = $('#value_data_type').val();
        
        newNode.nillable_flag = $('input[name=nillable_flag]:checked').val();
        newNode.value_domain = {
            enumeration_flag: [$('input[name=enumeration_flag]:checked').val()],
            value_data_type: [dt],
            unit_of_measure_type: [$('#unit_of_measure_type').val()]
        }
        
        if (dt == 'ASCII_Integer') {
            let min = $('#minimum_value').val();
            let max = $('#maximum_value').val();
            if (min || min === 0) newNode.value_domain.minimum_value = [min];
            if (max) newNode.value_domain.minimum_value = [max];
        }
        else if (dt == 'ASCII_Short_String_Collapsed') {
            let min = $('#minimum_characters').val();
            let max = $('#maximum_characters').val();
            if (min || min === 0) newNode.value_domain.minimum_characters = [min];
            if (max || max === 0) newNode.value_domain.maximum_characters = [max];
        }
    }
    
    // metadata has been collected from user:
    // update model and d3
    data.addNode(newNode);

    toggleNodes();

    // close modal
    closeModal();
};



function closeModal() {
    Custombox.modal.close();
};