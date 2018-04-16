$(document).ready( function() {
    $("#html-button").click(function () {
        $(this).closest("form").attr("action", "/file/to/html");
    });
    $("#json-button").click(function () {
        $(this).closest("form").attr("action", "/file/to/json");
    });
    $("#graph-button").click(function () {
        $(this).closest("form").attr("action", "/file/to/graph");
    });
    $("#inputfile").each(function () {
        var $input = $(this);
        var $label = $($input.next("label"));
    
        $input.on('change', function (e) {
            var fileName = '';
            if (e.target.value) {
                fileName = e.target.value.split('\\').pop();
                $label.find('span').html(fileName);
                $(".buttons input").prop('disabled', false);
            }
    
            // Firefox bug
            $input.on('focus', function () { $input.addClass('has-focus') });
            $input.on('blur', function () { $input.addClass('has-focus') });
        })
    })
});