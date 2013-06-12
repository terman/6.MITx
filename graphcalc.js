var graphcalc = (function () {
    var exports = {};
    
    function graph(canvas,expression,x1,x2) {
        var ctx = canvas[0].getContext('2d');
        var w = canvas.width();
        var h = canvas.height();
        canvas[0].width = w;
        canvas[0].height = h;
        ctx.clearRect(0,0,w,h);
        
        var tree,v1,v2;
        try {
            // step 1: compute expression values
            tree = calculator.parse(expression);
            v1 = calculator.evaluate(calculator.parse(x1));
            v2 = calculator.evaluate(calculator.parse(x2));
            if (v2 < v1) {
                var temp = v1;
                v1 = v2;
                v2 = temp;
            }
            var x = [];
            var y = [];
            var e = calculator.new_environment();
            var step = (v2-v1)/w;
            for (var v = v1; v <= v2; v += step) {
                x.push(v);
                e.x = v;
                y.push(calculator.evaluate(tree,e));
            }
            var npoints = x.length;
            
            // step 2: figure out plot scale
            var xscale = (x[npoints-1]-x[0])/w;
            var ymin = Math.min.apply(null,y);
            var ymax = Math.max.apply(null,y);
            var yextra = (ymax - ymin)/10;
            ymin -= yextra;
            ymax += yextra;
            var yscale = (ymax - ymin)/h;
            function xform(xv,yv) {
                return {x: (xv-x[0])/xscale, y: (ymax - yv)/yscale};
            }
            
            // step 3: plot points
            ctx.beginPath();
            var pt = xform(x[0],y[0]); ctx.moveTo(pt.x,pt.y);
            for (var i = 1; i < npoints; i += 1) {
                pt = xform(x[i],y[i]);
                ctx.lineTo(pt.x,pt.y);
            }
            ctx.lineWidth = 3;
            ctx.strokeStyle = "red";
            ctx.stroke();
        } catch (err) {
            // display error message in middle of canvas
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.font = "20px Georgia";
            ctx.fillText(err,w/2,h/2);
        }
    }
    
    function setup(div) {
        var canvas = $('<canvas></canvas>');
        var div1 = $('<div class="control"></div>');
        var div2 = $('<div class="control"></div>');
        var button = $('<button>Plot</button>');
        
        var expression = $('<input type="text" id="expression"></input>');
        div1.append('f(x):',expression);
        
        var minx = $('<input type="text"></input>');
        var maxx = $('<input type="text"></input>');
        div2.append('min x:',minx,'max x:',maxx);
        
        button.on("click",function() {
            var exp = expression.val();
            var x1 = minx.val();
            var x2 = maxx.val();
            graph(canvas,exp,x1,x2);
        });
   
        $(div).append(canvas,div1,div2,button);
    }
    exports.setup = setup;
    
    return exports;
}());

$(document).ready(function() {
    $('.graphcalc').each(function() {
        graphcalc.setup(this);  
    });
});