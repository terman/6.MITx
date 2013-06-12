var graphcalc = (function () {
    var exports = {};
    
    // canvas is the DOM object
    function graph(canvas,expression,x1,x2) {
        var w = canvas.width;
        var h = canvas.height;
	var ctx;
        
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
            var e = {e: Math.E, pi: Math.pi};
            var step = (v2-v1)/w;
            for (var v = v1; v <= v2; v += step) {
                x.push(v);
                e.x = v;
                y.push(calculator.evaluate(tree,e));
            }
            var npoints = x.length;
            canvas.x_data = x;           // save for event handlers
            canvas.y_data = y;
            
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
            canvas.x_scale = xscale;     // save for event handlers
            canvas.y_scale = yscale;
            canvas.y_max = ymax;
            
            // step 3: plot points into background image
            var bg_image = $('<canvas></canvas>')[0];
            canvas.bg_image = bg_image;   // save for event handlers
            bg_image.width = w;
            bg_image.height = h;
            ctx = bg_image.getContext('2d');
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0,0,w,h);
            ctx.beginPath();
            var pt = xform(x[0],y[0]); ctx.moveTo(pt.x,pt.y);
            for (var i = 1; i < npoints; i += 1) {
                pt = xform(x[i],y[i]);
                ctx.lineTo(pt.x,pt.y);
            }
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.strokeStyle = "red";
            ctx.stroke();
            
            // step 4: paint background on canvas
            ctx = canvas.getContext('2d');
            ctx.drawImage(bg_image,0,0);
        } catch (err) {
            // display error message in middle of canvas
	    ctx = canvas.getContext('2d');
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.font = "20px Georgia";
	    ctx.fillStyle = "black";
            ctx.fillText(err,w/2,h/2);
        }
    }
    
    // using array of xdata and ydata, interpolate y value
    // given a particular x
    function interpolate(xdata,ydata,x) {
        return x;
    }
    
    // called from mousemove event handler.  Canvas is the jQuery object
    function measure(canvas,ex) {
        var c = canvas[0];
        var offset = canvas.offset();
        var mx = ex - offset.left;
        
        // no data, nothing to measure :)
        if (c.x_data === undefined) return;
        
        // redraw background followed by vertical cursor overlay
        var ctx = c.getContext('2d');
        ctx.drawImage(c.bg_image,0,0);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#C0C0C0";
        ctx.beginPath();
        ctx.moveTo(mx,0);
        ctx.lineTo(mx,c.height);
        ctx.stroke();
        
        // add intersection information
        // var xintersect = mx*c.x_scale + c.x_data[0];
        // var yintersect = interpolate(c.x_data,c.y_data,xintersect);
        // var my = (c.y_max - yintersect)/c.y_scale;
        // ctx.font = "10px Arial";
        // ctx.fillStyle = "black";
        // ctx.fillText(xintersect+","+yintersect,mx,100);
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
            canvas[0].width = canvas.width();
            canvas[0].height = canvas.height();
            var exp = expression.val();
            var x1 = minx.val();
            var x2 = maxx.val();
            graph(canvas[0],exp,x1,x2);
        });
        
        canvas.on("mousemove",function(event) {
            measure(canvas,event.pageX);
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
