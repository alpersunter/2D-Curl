let myCanvas;
let disk;
let Vx;
let Vy;
function setup() {
    myCanvas = createCanvas(windowWidth*.9, windowHeight);
    disk = new Disk2D(80, 5);
    Vx = ((x, y) => Math.cos(x+2*y));
    Vy = ((x, y) => Math.sin(x-2*y));
    disk.V_x = Vx;
    disk.V_y = Vy;
}



function draw(){
    background(0);
    translate(width/2.0, height/2.0);
    drawVectorField(Vx, Vy);
    stroke(255,0,0);
    strokeWeight(3);
    fill(255,200);
    textSize(32);
    textAlign(CENTER, CENTER);
    disk.update();
    disk.show();
}

function vectorFieldChanged(v_x, v_y){
    let Vxx = new Function("x", "y", "return "+ v_x);
    let Vyy = new Function("x", "y", "return "+ v_y);
    disk.V_x = Vxx;
    disk.V_y = Vyy;
    Vx = Vxx;
    Vy = Vyy;
    disk.stop();
}

class Disk2D{
    constructor(radius, mass){
        this.radius = radius;
        this.mass = mass;
        this.angle = 0;
        this.position = createVector(0,0);
        this.angularVelocity = 0;
        this.V_x;
        this.V_y;
        this.I = 0.5 * this.mass * this.radius * this.radius;
        this.timeSpeed = 1.0;
        this.netTorque = 0;
    }
    update(){
        this.netTorque = calculateCurlAt(this.V_x, this.V_y, this.position);
        let angular_acceleration = this.netTorque / this.I;
        this.angularVelocity += angular_acceleration*this.timeSpeed;
        this.angle += this.angularVelocity*this.timeSpeed;
        this.angle = this.angle % TWO_PI;
        if(mouseIsPressed && this.mouseHovers()){
            // reposition and reset
            this.position.x = mouseX - width/2.0;
            this.position.y = mouseY - height/2.0;
            this.stop();
        }
    }
    stop(){
        this.angularVelocity = 0;
        this.angle = 0;
        this.netTorque = 0;
    }
    show(){
        if(this.mouseHovers()){
            fill(255,0,0,100);
            text("Curl: " + this.netTorque.toFixed(3), this.position.x, this.position.y);
        }
        ellipse(this.position.x, this.position.y, this.radius*2.0, this.radius*2.0);
        translate(this.position.x, this.position.y);
        rotate(-this.angle);
        arrow(createVector(this.radius, 0), true);
    }
    mouseHovers(){
        return dist(mouseX-width/2.0, mouseY-height/2.0, this.position.x, this.position.y) < this.radius;
    }
}

function drawVectorField(V_x, V_y){
    let arrowSpacing = 100.0;
    for(let x = -width/2.0; x <= width/2; x+=arrowSpacing){
        for(let y = -height/2.0; y <= height/2.0; y+= arrowSpacing){
            translate(x, y);
            createVector(V_x(x, y), V_y(x, y)).normalize().mult(40).show();
            translate(-x, -y);
    }}
}

function calculateCurlAt(V_x, V_y, P){
    // dV_y/dx - dV_x/dy
    let h = 0.0001;
    let dV_y = (V_y(P.x+h, P.y)-V_y(P.x-h, P.y))/(2.0*h);
    let dV_x = (V_x(P.x, P.y+h)-V_x(P.x, P.y-h))/(2.0*h);

    return dV_y - dV_x;
}

p5.Vector.prototype.show = (function(){
    stroke(50,200,255,230);
    strokeWeight(3);
    fill(50,200,255,230);
    arrow(this, false);
});

function arrow(vector_2d, isStroke){
    let L = vector_2d.mag();
    push();
        rotate(-vector_2d.heading());
        let x_tri = L*0.6;
        line(0,0, x_tri, 0);
        let y_tri = (L-x_tri)/1.71;
        if (!isStroke) noStroke();
        triangle(x_tri, y_tri, x_tri, -y_tri, L, 0)
    pop();
}