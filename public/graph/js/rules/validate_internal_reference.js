const rule = {
    "name": "",
    "params" : {
        "id": "The name of the rule",
        "context_element": "The element from which this rule is evaluated. All `Internal_Reference` below this element will be validated.",
        "value": "The value that all of the `Internal_Reference/reference_type` must match"
    },
    "ruletext": (id, context_element, value) => 
`
<DD_Rule>
  <local_identifier>${id}</local_identifier>
  <rule_context>${context_element}/pds:Internal_Reference</rule_context>
  <DD_Rule_Statement>
    <rule_type>Assert</rule_type>
    <rule_test>pds:reference_type = ('${value}')</rule_test>
    <rule_message>In ${context_element}, the attribute pds:reference_type must have a value of "${value}".</rule_message>
  </DD_Rule_Statement>
</DD_Rule>
`
};

module.exports = rule;