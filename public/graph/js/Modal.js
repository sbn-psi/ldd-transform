app.factory('Modal', function() {
    const Modal = function(type) {
        if (!type) type = null;
        return {
            isVisible: false,
            type: type,
            open: function(type) {
                this.isVisible = true;
                this.type = type;
            },
            close: function() {
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
