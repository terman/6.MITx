var counter = (function () {

    function setup(div) {

    }

    // items accessible to outsiders
    return { setup: setup };
}());


$(document).ready(function() {
    $('.counter').each(function() {
	    counter.setup($(this));
    });
});
