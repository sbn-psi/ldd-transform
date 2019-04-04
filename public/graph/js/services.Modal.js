app.factory('Modal', function() {
    const Modal = function(type) {
        if (!type) type = null;
        return {
            isVisible: false,
            type: type,
            show: function(type) {
                this.isVisible = true;
                this.type = type;
            },
            hide: function() {
                this.isVisible = false;
                this.type = null;
            }
        };
    };

    return {
        new: function(type) {
            return new Modal(type);
        }
    }
});
