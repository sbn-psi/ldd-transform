$(document).ready( function() {
    var graphLocation = window.location.href + 'graph/';
    
    // set the form action depending on which button is clicked
    $("#html-button").click(function () {
        $(this).closest("form").attr("action", "/file/to/html");
    });
    $("#json-button").click(function () {
        $(this).closest("form").attr("action", "/file/to/json");
    });
    $("#graph-button").click(function () {
        $(this).closest("form").attr("action", "/file/to/graph");
    });
    $("#doc-button").click(function () {
        $(this).closest("form").attr("action", "/file/to/doc");
    });
    $("#vis-button").click(function(e) {
        // prevent default form action
        e.preventDefault();
        
        var fileInput = document.getElementById('inputfile');
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append('file', file);
        
        var xhr = new XMLHttpRequest();
        
        xhr.open('POST','file/to/json',true);
        xhr.send(formData);
        xhr.onreadystatechange = function(res) {
            if (xhr.readyState === 4) {
                localStorage.setItem('ld3',xhr.response);
                window.location.href = graphLocation;
            };
        };
    });
    $('#new-ldd').click(function() {
        localStorage.removeItem('ld3');
        window.location.href = graphLocation;
    });
    // change the uploader label when a file is staged
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

    // display loading circle when form submitted 
    $('form').submit(function() {
        $('.sk-cube-grid').toggle();
        $('.buttons').toggle();
    });
});