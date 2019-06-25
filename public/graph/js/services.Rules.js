app.factory('DDRules', function() {
    function ActiveRule(rule) {
        this.rule = null;
        
        this.set = function(rule) {
            // takes a fully parameterized rule object
            // and flattens it for use with a simple form
            this.rule = new DD_Rule(rule);
            return;
        };
        
        this.get = function() {
            return this.rule;
        };
        
        if (!rule) this.rule = null;
        else this.set(rule);
    };
    
    let DDRules = {
        all: [],
        
        set: function(rules) {
            if (rules === null) {
                this.all = [];
                this.activeRule = null;
            } else {
                this.all = rules;
                this.activeRule = new ActiveRule(rules[0]);
            };
        },
        
        // initialize to first rule in list
        activeRule: new ActiveRule(),
        
        isActiveRule: function(rule) {
            return (!this.activeRule || !this.activeRule.rule || !rule) ? false : rule.local_identifier[0] === this.activeRule.rule.local_identifier;
        }
    };
    return DDRules;
});

