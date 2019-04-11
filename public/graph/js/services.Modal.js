app.factory('Modal', function($rootScope) {
    const Modal = function(type) {
        if (!type) type = null;
        return {
            isVisible: false,
            type: type,
            show: function(type) {
                this.isVisible = true;
                this.type = type;
                $rootScope.$broadcast('modal-show');
            },
            hide: function() {
                this.isVisible = false;
                this.type = null;
                $rootScope.$broadcast('modal-hide');
            }
        };
    };

    return {
        new: function(type) {
            return new Modal(type);
        }
    }
});
