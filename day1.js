/*
  calculate: evaluate the value of an arithmetic expression
*/
function calculate(text) {
    var pattern = /\d+|\+|\-|\*|\/|\(|\)/g;
    var tokens = text.match(pattern);
    return JSON.stringify(tokens);
}

function setup_calc(div) {
    var input = $('<input></input>',{type: "text", size: 50});
    var output = $('<div></div>');
    var button = $('<button>Calculate</button>');
    button.bind("click",function () {
        output.text(String(calculate(input.val())));
    });
    
    $(div).append(input,button,output);
}

$(document).ready(function (){
    $('.calculator').each(function () {
        // this refers to the <div> with class calculator
        setup_calc(this);
    });
});