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
    if (activeNode.lid.split('.')[0] != data.model['Ingest_LDD']['namespace_id']) {

        $('#ld3-modal').load('./partials/error.modal.html', function() {
            $("#errorModalMessage").text(`Only elements that belong to the LDD namespace ("${data.model['Ingest_LDD']['namespace_id']}") can be modified.`);
            addListeners();
        });

    } else {

        $('#ld3-modal').load('./partials/node.edit.html', function() {

            $('#version_id-editnode').val(activeNode.version_id[0]).focus();

            $('#identifier_reference-editnode').val(function() {
                try {
                    var output = activeNode.identifier_reference[0];
                    if (activeNode.identifier_reference.join('') == "") enableInput('identifier_reference-editnode');
                    return output;
                } catch (err) {
                    var output = activeNode.local_identifier[0];
                    if (activeNode.local_identifier.join('') == "") enableInput('identifier_reference-editnode');
                    return output;
                }
            });

            $('#name-editnode').val(function() {
                if (activeNode.name.join('') == "") enableInput('name-editnode')
                return activeNode.name[0];
            });

            $('#definition-editnode').val(activeNode.definition[0]);

            $('#submitter_name-editnode').val(activeNode.submitter_name[0]);

            addListeners();

        });

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
    }
};

function saveNode() {
    name = document.getElementById('name').value;
    v_id = document.getElementById('version_id').value;
    s_n = document.getElementById('submitter_name').value;
    def = document.getElementById('definition').value;
    if (r_t == 'attribute_of') n_f = $('input[name=nillable_flag]:checked').val();

    newNode.name = name;
    newNode.version_id = v_id;
    newNode.submitter_name = s_n;
    newNode.definition = def;
    newNode.nillable_flag = n_f;

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