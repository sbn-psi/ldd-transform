app.factory('ErrorHandler', function($rootScope) {
    let ErrorObj = {
        message: null,
        trace: null,
        
        set: function(message, trace) {
            this.message = message;
            this.trace = trace;
            
            $rootScope.$broadcast('new-error');
        },
        get: function(x) {
            if (x) throw new Error('Invalid arguments: method `get` is a getter.');
            
            return {
                message: this.message,
                trace: this.trace
            };
        }
    };
    
    return ErrorObj;
});