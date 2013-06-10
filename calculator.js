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
            term = ['/', term, parse_unary(tokens)];
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

var built_in_functions = {
    abs: Math.abs,
    acos: Math.acos,
    asin: Math.asin,
    atan: Math.atan,
    atan2: Math.atan2, // 2 arg
    ceil: Math.ceil,
    cos: Math.cos,
    exp: Math.exp,
    floor: Math.floor,
    log: Math.log,
    max: Math.max,  // multi-arg
    min: Math.min,  // multi-arg
    pow: Math.pow,  // 2 arg
    round: Math.round,
    sin: Math.sin,
    sqrt: Math.sqrt,
};

var built_in_environment = {
    pi: Math.PI,
    e: Math.E,
}

function parse_factor(tokens) {
    if (read_token('(',tokens)) {
        var exp = parse_expression(tokens);
        if (read_token(')',tokens)) {
            return exp;
        } else throw 'Missing ) in expression';
    }
    else if (tokens.length > 0) {
        var token = tokens.shift();  // extract first token from array
        if (token.search(/[a-zA-Z_]\w*/) != -1) {
            // variable name
            if (read_token('(',tokens)) {
                // a function call, parse the argument(s)
                var args = [];
                // code assumes at least one argument
                while (true) {
                    args.push(parse_expression(tokens));
                    if (read_token(',',tokens)) continue;
                    if (read_token(')',tokens)) break;
                    throw "Expected comma or close paraen in function call";
                }
                if (!(token in built_in_functions))
                    throw "Call to unrecognized function: " + token;
                return ['call '+token].concat(args);
            }
            // otherwise its just a reference to a variable
            return token;
        }
        // only option left: a number
        var n = parseFloat(token,10);
        if (isNaN(n)) throw 'Expected a number, got '+String(token);
        return n;
    }
    else throw 'Unexpected end of expression';
}

function evaluate(tree,environment) {
    if (environment === undefined) environment = built_in_environment;
    if (typeof tree == 'number') return tree;
    else if (typeof tree == 'string') return environment[tree];  // might be undefined
    else {
        // expecting [operator,tree,...]
        var args = tree.slice(1).map(function(subtree){return evaluate(subtree,environment)});
        if (tree[0].search(/^call /) != -1) {
            // call of built-in function
            var f = tree[0].slice(5);
            f = built_in_functions[f];
            if (f === undefined) throw "Unknown function: "+f;
            return f.apply(undefined,args);
        }
        // otherwise its just an operator
        else switch (tree[0]) {
            case 'neg': return -args[0];
            case '+':   return args[0] + args[1];
            case '-':   return args[0] - args[1];
            case '*':   return args[0] * args[1];
            case '/':   return args[0] / args[1];
            default:    throw 'Unrecognized operator '+tree[0];
        }
    }
}

function parse(text) {
    // pattern matches integers, variable names, parens and the operators +, -, *, /
    var pattern = /([0-9]*\.)?[0-9]+([eE][\-+]?[0-9]+)?|[a-zA-Z_]\w*|\+|\-|\*|\/|\(|\)/g;
    var tokens = text.match(pattern);
    return parse_expression(tokens);
}

function calculate(text) {
    try {
        var tree = parse(text);
        return evaluate(tree,built_in_environment);
    } catch(err) {
        return err;
    }
}

function setup_calc(div) {
    var input = $('<input></input>',{type: 'text', size: 50});
    var output = $('<div></div>');
    var button = $('<button>Calculate</button>');
    button.bind("click", function() {
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
