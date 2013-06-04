// <expression> ::= <term> | <term> "+" <expression> | <term> "-" <expression>
// <term>       ::= <unary> | <unary> "*" <term> | <unary> "/" <term>
// <unary>      ::= <factor> | "-" <factor> | "+" <factor>
// <factor>     ::= <number> | "(" <expression> ")"

// if first token is t, consume it and return true
function read_token(t,tokens) {
    if (tokens.length > 0 && tokens[0] == t) {
        tokens.shift();
        return true;
    }
    return false;
}

function parse_expression(tokens) {
    var term = parse_term(tokens);
    if (read_token('+',tokens)) {
        return ['+',term,parse_expression(tokens)];
    }
    else if (read_token('-',tokens)) {
        return ['-',term,parse_expression(tokens)];
    }
    else return term;
}

function parse_term(tokens) {
    var unary = parse_unary(tokens);
    if (read_token('*',tokens)) {
        return ['*',unary,parse_term(tokens)];
    }
    else if (read_token('/',tokens)) {
        return ['/',unary,parse_term(tokens)]
    }
    else return unary;
}

function parse_unary(tokens) {
    if (read_token('-',tokens)) {
        return ['neg',parse_factor(tokens)];
    }
    else if (read_token('+',tokens)) {
        return parse_factor(tokens);
    }
    else return parse_factor(tokens);
}

function parse_factor(tokens) {
    if (read_token('(',tokens)) {
        gitvar exp = parse_expression(tokens);
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
