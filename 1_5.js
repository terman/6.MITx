function calculate(text) {
    // pattern to match integers, operators (+,-,*,/), parens
    var pattern = /([0-9]*\.)?[0-9]+([eE][-+]?[0-9]+)?|\+|\-|\*|\/|\(|\)/g;
    var tokens = text.match(pattern);
    return JSON.stringify(tokens);
}

function setup_calc(div) {
    var input = $('<input></input>',{type: 'text', size: 50});
    var output = $('<div></div>');
    var button = $('<button>Calculate</button>');
    button.bind("click",function () {
        output.html(String(calculate(input.val())));
    });
    
    $(div).append(input,button,output);
}

$(document).ready(function() {
    $('.calculator').each(function () {
        setup_calc(this);
    });
});