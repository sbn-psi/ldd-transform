// A user should only have to pass in a LIST OF PARAMETERS (stored as an object is fine)
// and the class invoked should handle management and implementation of the structure of the
// class being constructed.

// NO VALIDATION IS ENFORCED HERE
    // client app responsibile for conditional validation
    // ALTHOUGH perhaps content validation could take place here?

const defaultValues = {
    version_id:           "1.0",
    unit_of_measure_type: "Units_of_None",
    value_data_type:      "ASCII_Real",
    nillable_flag:        false,
    enumeration_flag:     false,
    minimum_occurrences:  0
};

function Ingest_LDD(ldd) {
    if (!ldd) ldd = {};
    
    this.name                        = ldd.name;
    this.version_id                  = ldd.version_id || defaultValues.version_id;
    this.full_name                   = ldd.full_name;
    this.steward_id                  = ldd.steward_id;
    this.namespace_id                = ldd.namespace_id;
    this.external_property_maps_id   = ldd.external_property_maps_id;
    this.comment                     = ldd.comment;
    this.last_modification_date_time = ldd.last_modification_date_time;

    this['DD_Attribute']             = new DD_Attribute();
    this['DD_Class']                 = new DD_Class();
    // this['DD_Rule']                  = new DD_Rule();
    // this['Property_Maps']            = new Property_Maps();
};

function DD_Class(c) {
    if (!c) c = {};

    this.name                       = c.name;
    this.version_id                 = c.version_id || defaultValues.version_id;
    this.local_identifier           = c.local_identifier;
    this.submitter_name             = c.submitter_name;
    this.definition                 = c.definition;
    this.abstract_flag              = c.abstract_flag;
    this.element_flag               = c.element_flag;

    // this['Internal_Reference']   = new Internal_Reference();

    // this is a XSChoice: DD_Association OR DD_Association_External must be present (0..*)
    this['DD_Association']          = new DD_Association();
    // this['DD_Association_External'] = new DD_Association_External();
};

function DD_Association(a) {
    if (!a) a = {};

    this.identifier_reference = a.identifier_reference;
    this.local_identifier = a.local_identifier;
    this.reference_type = a.reference_type;
    this.minimum_occurrences = a.minimum_occurrences;
    this.maximum_occurrences = a.maximum_occurrences;
    this.constant_value = a.constant_value;

    // this['DD_Attribute_Reference'] = new DD_Attribute_Reference();
    // this['DD_Class_Reference'] = new DD_Class_Reference();
};

function DD_Attribute(a) {
    if (!a) a = {};

    this.name                    = a.name;
    this.version_id              = a.version_id || defaultValues.version_id;
    this.local_identifier        = a.local_identifier;
    this.nillable_flag           = a.nillable_flag || defaultValues.nillable_flag;
    this.submitter_name          = a.submitter_name;
    this.definition              = a.definition;
    this.comment                 = a.comment;

    // this['Internal_Reference']   = new Internal_Reference();
    this['DD_Value_Domain']      = new DD_Value_Domain(a);

    // LD3-specific keywords
    this.lid                     = a.lid;
};

function DD_Value_Domain(d) {
    if (!d) d = {};

    this.enumeration_flag     = d.enumeration_flag || defaultValues.enumeration_flag;
    this.value_data_type      = d.value_data_type || defaultValues.value_data_type;
    this.formation_rule       = d.formation_rule;
    this.minimum_characters   = d.minimum_characters;
    this.maximum_characters   = d.maximum_characters;
    this.minimum_value        = d.minimum_value;
    this.maximum_value        = d.maximum_value;
    this.pattern              = d.pattern;
    this.unit_of_measure_type = d.unit_of_measure_type || defaultValues.unit_of_measure_type;
    this.specified_unit_id    = d.specified_unit_id;

    this['Permissible_Value'] = new Permissible_Value(d);
};

function Permissible_Value(p) {
    if (!p) p = {};

    this.value = p.value;
    this.value_meaning = p.value_meaning;
};

function DD_Rule(r) {
    if (!r) r = {};
    
    this.local_identifier = r.local_identifier[0];
    this.rule_assign = r.rule_assign; // TODO
    this.rule_context = r.rule_context[0];
    
    // this['DD_Attribute_Reference'] = new DD_Attribute_Reference(r);
    // this['DD_Class_Reference'] = new DD_Class_Reference(r);
    // this['DD_Rule_Statement'] = new DD_Rule_Statement(r);
    
    if (r['DD_Rule_Statement'] && r['DD_Rule_Statement'].length) {
        const rs = r['DD_Rule_Statement'][0];
        
        if (rs.rule_description) this.rule_description = rs['rule_description'][0];
        if (rs.rule_message) this.rule_message = rs['rule_message'][0];
        if (rs.rule_test) this.rule_test = rs['rule_test'][0];
        if (rs.rule_type) this.rule_type = rs['rule_type'][0];
        if (rs.rule_value) this.rule_value = rs['rule_value'][0];
    }
};

function DD_Rule_Statement(r) {
    if (!r) r = {};
    console.log(r);
    
};