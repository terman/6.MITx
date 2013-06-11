function test_clear() {
    var canvas = $('#test');
    var ctx = canvas[0].getContext('2d');
    
    ctx.clearRect(0,0,canvas.width(),canvas.height());
}

function test_line() {
    var canvas = $('#test');
    var ctx = canvas[0].getContext('2d');

    ctx.beginPath();
    ctx.moveTo(50,50);
    ctx.lineTo(150,50);
    ctx.lineTo(150,150);
    ctx.lineTo(50,150);
    ctx.lineTo(50,50);
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.fill();
}

function test_star() {
    var cx = 100;
    var cy = 100;
    var r1 = 75;
    var r2 = 40;
    var astep = 2*Math.PI/10;

    function p2r(r,a) {
        return {x: r*Math.cos(a) + cx, y: -r*Math.sin(a) + cy};
    }
    
    var canvas = $('#test');
    var ctx = canvas[0].getContext('2d');

    ctx.beginPath();
    var pt = p2r(r1,Math.PI/2); ctx.moveTo(pt.x,pt.y);
    for (var i = 1; i <= 10; i += 1) {
         pt = p2r((i % 2) == 1 ? r2 : r1,Math.PI/2+i*astep);
         ctx.lineTo(pt.x,pt.y); 
    }
    ctx.stroke();
}

function test_rect() {
    var canvas = $('#test');
    var ctx = canvas[0].getContext('2d');

    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.fillRect(25,25,100,100);
    ctx.fillStyle = "blue";
    ctx.fillRect(75,75,100,100);
}

function test_smiley() {
    var canvas = $('#test');
    var ctx = canvas[0].getContext('2d');

    // filled face
    ctx.beginPath();
    ctx.arc(100,100,75,0,2*Math.PI);
    ctx.fillStyle = "yellow";
    ctx.fill();
    
    // black border
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // eyes
    ctx.beginPath();
    ctx.arc(70,80,10,0,2*Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(130,80,10,0,2*Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    
    // smile!
    ctx.beginPath();
    ctx.arc(100,100,40,Math.PI/4,3*Math.PI/4);
    ctx.stroke();
}

function test_text() {
    var canvas = $('#test');
    var ctx = canvas[0].getContext('2d');

    ctx.fillStyle = "black";
    ctx.font = "20px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Hi!",100,100);

}

var coords = [];
for (var i = 0; i < 50000; i += 1) {
    coords.push([Math.random()*200,Math.random()*200]);
}
function complicated_figure(ctx) {
    for (var i = 0; i < coords.length; i += 1) {
        ctx.beginPath();
        ctx.strokeStyle = "grey";
        ctx.arc(coords[i][0],coords[i][1],5,0,2*Math.PI);
        ctx.stroke();
    }
}

function test_mouse() {
    var canvas = $('#test');
    var offset = canvas.offset();
    var ctx = canvas[0].getContext('2d');
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    
    var bg_image = $("<canvas></canvas>")[0];
    bg_image.width = 200;
    bg_image.height = 200;
    complicated_figure(bg_image.getContext('2d'));
    ctx.drawImage(bg_image,0,0);
    
    canvas.bind("mousemove",function(event) {
        var mx = Math.round(event.pageX - offset.left);
        var my = Math.round(event.pageY - offset.top);
        //ctx.clearRect(0,0,canvas.width(),canvas.height());
        //complicated_figure(ctx);
        ctx.drawImage(bg_image,0,0);
        ctx.beginPath();
        ctx.moveTo(mx-10,my); ctx.lineTo(mx+10,my);
        ctx.moveTo(mx,my-10); ctx.lineTo(mx,my+10);
        ctx.stroke();
        ctx.fillText(mx+","+my,mx+4,my-4);
    });
 
}