// if first token is t, consume it and return true
function read_token(t,tokens) {
    if (tokens.length > 0 && tokens[0] == t) {
        tokens.shift();
        return true;
    }
    return false;
}

// builds parse tree for following BNF.  Tree is either a number or
// or an array of the form [operator,tree,tree].
// <expression> ::= <term> | <expression> "+" <term> | <expression> "-" <term>
// <term>       ::= <unary> | <term> "*" <unary> | <term> "/" <unary>
// <unary>      ::= <factor> | "-" <factor> | "+" <factor>
// <factor>     ::= <number> | "(" <expression> ")"
function parse_expression(tokens) {
    var expression = parse_term(tokens);
    while (true) {
        if (read_token('+', tokens)) {
            expression = ['+', expression, parse_term(tokens)];
        }
        else if (read_token('-', tokens)) {
            expression = ['-', expression, parse_term(tokens)];
        }
        else break;
    }
    return expression;
}

function parse_term(tokens) {
    var term = parse_unary(tokens);
    while (true) {
        if (read_token('*', tokens)) {
            term = ['*', term, parse_unary(tokens)];
        }
        else if (read_token('/', tokens)) {
            term = ['/', term, parse_unary(tokens)]
        }
        else break;
    }
    return term;
}

function parse_unary(tokens) {
    if (read_token('-',tokens)) {
        return ['neg',parse_factor(tokens)];
    }
    else if (read_token('+',tokens)) {
    }
    return parse_factor(tokens);
}

function parse_factor(tokens) {
    if (read_token('(',tokens)) {
        var exp = parse_expression(tokens);
        if (read_token(')',tokens)) {
            return exp;
        } else throw 'Missing ) in expression';
    }
    else if (tokens.length > 0) {
        var n = parseInt(tokens[0],10);
        if (isNaN(n)) throw 'Expected a number, got '+String(tokens[0]);
        tokens.shift();
        return n;
    }
    else throw 'Unexpected end of expression';
}

function evaluate(tree) {
    if (typeof tree == 'number') return tree;
    else {
        // expecting [operator,tree,tree]
        var args = tree.slice(1).map(evaluate);
        switch (tree[0]) {
            case 'neg': return -args[0];
            case '+':   return args[0] + args[1];
            case '-':   return args[0] - args[1];
            case '*':   return args[0] * args[1];
            case '/':   return args[0] / args[1];
            default:    throw 'Unrecognized operator '+tree[0];
        }
    }
}

function calculate(text) {
    // pattern matches integers, parens and the operators +, -, *, /
    var pattern = /\d+|\+|\-|\*|\/|\(|\)/g;
    var tokens = text.match(pattern);
    try {
        var tree = parse_expression(tokens);
        //return JSON.stringify(tree);
        return evaluate(tree);
    } catch(err) {
        return err;
    }
}

function setup_calc(div) {
    var input = $('<input></input>',{type: 'text', size: 50});
    var output = $('<div></div>');
    var button = $('<button>Calculate</button>').bind("click", function() {
        output.html(String(calculate(input.val())));
    });
    
    $(div).append(input,button,output);
}

$(document).ready(function() {
    // look for nodes of class "calculator" and set them up
    $('.calculator').each(function() {
        setup_calc(this);
    });
});
