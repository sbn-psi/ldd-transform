app.factory('Modal', function($rootScope) {
    let Modal = {
        isVisible: false,
        type: null,
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
    return Modal;
});