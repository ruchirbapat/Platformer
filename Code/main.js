//Setup
var canvas = document.getElementById("canvas");
canvas.width = canvas.height = 680;
console.log("Canvas loaded.");
var context = (check(canvas)) ? canvas.getContext("2d") : null;
console.log("Context loaded.");
check(context);

canvas.style.background = "rgb(52, 55, 60)";
console.log("Background colour set to " + canvas.style.background + ".");

//Variables
var boxes = [];
var quadTreeRects = [];
var heldKeys = [];
const FRAMERATE = 75;
const BOX_SIZE = 20;
const GRAVITY = 0.984;
const JUMP_VELOCITY = 15.5;
const SPEED = 12.5;
const ACCELERATION = 1;
const SMOOTHNESS = 0.85;
const columns = Math.floor((canvas.height - BOX_SIZE) / BOX_SIZE);
const rows = Math.floor((canvas.width - BOX_SIZE) / BOX_SIZE);
const fillAmount = 50;
var quadTree = new QuadTree();
var topLeftRect = new Rect(0, 0, (canvas.width / 2), (canvas.height / 2));
var topRightRect = new Rect((canvas.width / 2), 0, (canvas.width / 2), (canvas.height / 2));
var bottomLeftRect = new Rect((canvas.height / 2), 0, (canvas.width / 2), (canvas.height / 2));
var bottomRightRect = new Rect((canvas.width / 2), (canvas.height / 2), (canvas.width / 2), (canvas.height / 2));

//Create level
var level = new Array(columns);
for(var i = 0; i < level.length; i++)
    level[i] = new Array(rows);

check(level);

//Create player
var playerSpawnX, playerSpawnY;
playerSpawnX = canvas.width / 2;
playerSpawnY = canvas.height / 2;
player = new Player(playerSpawnX, playerSpawnY, columns, rows, "rgb(244,108,108)");
console.log("Player created.");
player.toString();
check(player);

//Create floor
var box = new Box(0, canvas.height - BOX_SIZE, canvas.width, BOX_SIZE, "rgb(100, 100, 255)");

//Cellular automata based block placement
for(var x = 0; x < columns; x++) {
    for(var y = 0; y < rows; y++) {
        if (x === 0 || x === ((canvas.width - BOX_SIZE)-1) || y === 0 || y == ((canvas.height - BOX_SIZE) - 1)) {
            level[x][y] = 1;
        }
        else {
            level[x][y] = (randomNumber(0, 100) < fillAmount)? 1: 0;
        }
    }
}

for (var x = 0; x < (canvas.width - BOX_SIZE); x ++) {
    for (var y = 0; y < (canvas.height - BOX_SIZE); y ++) {
        var neighbourWallTiles = getWalls(x,y);

        if (neighbourWallTiles > 4)
            level[x][y] = 1;
        else if (neighbourWallTiles < 4)
            level[x][y] = 0;

    }
}

//Returns walls around a node
function getWalls(x, y) {
    var walls = 0;
    for(var i=-1; i<2; i++){
        for(var j=-1; j<2; j++){
            var neighbour_x = x+i;
            var neighbour_y = y+j;
            if(i == 0 && j == 0){
                continue;
            } else if(neighbour_x < 0 || neighbour_y < 0 || neighbour_x >= level.length || neighbour_y >= level[0].length){
                walls++;
            } else if(level[neighbour_x][neighbour_y]){
                z = walls + 1;
            }
        }
    }
}

/*
//Print values
for(var x = 0; x < columns; x++) {
    for(var y = 0; y < rows; y++) {
        console.log("The value at level[" + x + "][" + y + "] is " + level[x][y]);
    }
}
*/

var wallCount = 0;
//Draws box at available nodes
for(var x = 0; x < columns; x++) {
    for(var y = 0; y < rows; y++) {
        if(level[x][y] === 1) {
            if((level[x][y].x > canvas.width) || (level[x][y].y > canvas.height) || (level[x][y].x < canvas.width) || (level[x][y].y < canvas.height)) {
                level[x][y] = null; delete level[x][y]; continue;
            }
            else {
                wallCount++;
                box = new Box(x * columns, y * rows, columns, rows, "rgb(100, 100, 255)"); 
            }
        }
    }
}

for(var i = 0; i < boxes.length; i++)
    quadTree.findQuad(boxes[i]);

console.log("Level generated with " + wallCount + " walls.");

requestForAnimator();

console.log("Animation frame requested.");

//Player
function Player(xPos, yPos, _width, _height, _renderColour) {
    this.x = xPos;
    this.y = yPos;
    this.width = _width;
    this.height = _height;
    this.colour = _renderColour;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.grounded = false;
    this.jumping = false;
    this.doubleJumping = false;
    this.jumpCount = 0;

    this.toString = function() {
        console.log("Player's position: (" + this.x + ", " + this.y + ")");
        console.log("Player's dimensions: (" + this.width + ", " + this.height + ")");
        console.log("Player's colour: " + this.colour);
        console.log("Player's velocity: (" + this.xVelocity + ", " + this.yVelocity + ")");
    }

    this.respawn = function() {
        this.x = playerSpawnX;
        this.y = playerSpawnY;
    }

    this.respawn = function(x, y) {
        this.x = x;
        this.y = y;
    }

    this.setVelocity = function(x, y) {
        this.xVelocity = x;
        this.yVelocity = y;
    }

    this.calculateVelocity = function() {
        if(input.getKeyDown(keyCode.upArrow) && this.grounded)
            this.setVelocity(0, -SPEED);

        if(input.getKeyDown(keyCode.rightArrow))
            this.setVelocity(SPEED, 0);

        if(input.getKeyDown(keyCode.leftArrow))
            this.setVelocity(-SPEED, 0);
    }

    this.adjustVelocityByCollision = function(toTest) {
        if((collisionChecker.testCollision(this, toTest) === "b") || this.y === canvas.height - BOX_SIZE) {
            this.setVelocity(this.xVelocity, 0);
            this.grounded = true;
            this.jumping = false;
        }
    }

    this.applyVelocity = function() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        this.y += GRAVITY;
    }

    this.resetVelocity = function() {
        this.xVelocity = 0;
        this.yVelocity = 0;
    }

    this.constrain = function() {
        this.x = clamp(this.x, 0, canvas.width - BOX_SIZE);
        this.y = clamp(this.y, 0, canvas.height - BOX_SIZE);
    }

    this.update = function() {
        this.resetVelocity();
        this.calculateVelocity();
        this.applyVelocity();
        this.constrain();
        this.resetVelocity();
    }

    this.move = function() {
        if(input.getKeyDown(keyCode.upArrow) || input.getKeyDown(keyCode.spacebarKey)) {
            if((!player.jumping) && player.grounded) {
                player.yVelocity = -JUMP_VELOCITY;
                player.grounded = false;
                player.jumping = true;
            }
        }

        if(input.getKeyDown(keyCode.leftArrow) && player.xVelocity > -SPEED)
            player.xVelocity -= ACCELERATION;

        if(input.getKeyDown(keyCode.rightArrow) && player.xVelocity < SPEED)
            player.xVelocity += ACCELERATION;

        player.xVelocity *= SMOOTHNESS;
        player.yVelocity += GRAVITY;

        player.y += player.yVelocity;
        player.x += player.xVelocity;
    }

    this.render = function() {
        context.fillStyle = this.colour;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

//Box
function Box(xPos, yPos, _width, _height, _renderColour) {
    this.x = xPos;
    this.y = yPos;
    this.width = _width;
    this.height = _height;
    this.colour = _renderColour;

    boxes.push(this);

    this.toString = function() {
        console.log("Box's position: (" + this.x + ", " + this.y + ")");
        console.log("Box's dimensions: (" + this.width + ", " + this.height + ")");
        console.log("Box's colour: " + this.colour);
    }

    this.constrain = function() {
        this.x = clamp(this.x, 0, canvas.width - BOX_SIZE);
        this.y = clamp(this.y, 0, canvas.height - BOX_SIZE);
    }

    this.render = function() {
        context.fillStyle = this.colour;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    
    this.renderAsCircle = function() {
        context.fillStyle = this.colour;
        context.arc(this.x, this.y, (this.width / 2), 0, 2 * Math.PI);
        context.fill();
    }
}

//Rect
function Rect(xPos, yPos, _width, _height) {
    this.x = xPos;
    this.y = yPos;
    this.width = _width;
    this.height = _height;
    this.objects = [];
    quadTreeRects.push(this);

    this.toString = function() {
        console.log("Rect's position: (" + this.x + ", " + this.y + ")");
        console.log("Rect's dimensions: (" + this.width + ", " + this.height + ")");
    }

    this.constrain = function() {
        this.x = clamp(this.x, 0, canvas.width - BOX_SIZE);
        this.y = clamp(this.y, 0, canvas.height - BOX_SIZE);
    }
}

function QuadTree() {
    this.findQuad = function(object) {
        if((object.x <= canvas.width / 2) && (object.y <= canvas.height / 2)) {
            topLeftRect.objects.push(object); return topLeftRect; }
        else if((object.x > canvas.width / 2) && (object.y < canvas.height / 2)) {
            topRightRect.objects.push(object); return topRightRect; }
        else if((object.x <= canvas.width / 2) && (object.y > canvas.height / 2)) {
            bottomLeftRect.objects.push(object); return bottomLeftRect; }
        else if((object.x > canvas.width / 2) && (object.y > canvas.height / 2)) {
            bottomRightRect.objects.push(object); return bottomRightRect; }
        else
            console.warning("The object " + object.constructor.name + " does not fit in the quadtree!");
    }
    
}

//Event listeners
function onKeyDown(key) {
    if(key.target == document.body) {
        key.preventDefault();
        heldKeys[key.keyCode] = true;
    }
}
window.addEventListener("keydown", onKeyDown, false);
console.log("keydown Event Listener set.");

function onKeyUp(key) {
    delete heldKeys[key.keyCode];
}
window.addEventListener("keyup", onKeyUp, false);
console.log("keyup Event Listener set.");

//Update function
console.log("About to render first frame!");
function update() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < boxes.length; i++)
        boxes[i].render();

    if(input.getKeyDown(keyCode.upArrow) || input.getKeyDown(keyCode.spacebarKey)) {
        if((!player.jumping) && player.grounded) {
            player.yVelocity = -JUMP_VELOCITY;
            player.grounded = false;
            player.jumping = true;
        }

    }

    if(input.getKeyDown(keyCode.leftArrow) && player.xVelocity > -SPEED)
        player.xVelocity -= ACCELERATION;

    if(input.getKeyDown(keyCode.rightArrow) && player.xVelocity < SPEED)
        player.xVelocity += ACCELERATION;

    player.xVelocity *= SMOOTHNESS;
    player.yVelocity += GRAVITY;

    player.y += player.yVelocity;
    player.x += player.xVelocity;
    
    quadTree.findQuad(player);
    
    for(var i = 0; i < boxes.length; i++) {
        //player.grounded = true;

        if(collisionChecker.quickBoxTest(player, boxes[i])) {

            var collDir = collisionChecker.testCollision(player, boxes[i]);

            if(collDir === "r" || collDir === "l" || player.y === (canvas.height - player.height)) {
                player.xVelocity = 0;
                player.jumping = false;
                player.doubleJumping = false;
                player.jumpCount = 0;
                //console.log("Player received a collision on the " + ((collDir === "r") ? "right" : "left") + "!");
            }
            if(collDir === "b") {
                player.grounded = true;
                player.yVelocity = 0;
                player.jumping = false;
                player.doubleJumping = false;
                player.jumpCount = 0;
                //console.log("Player received a collision on the bottom!");
            }
            if(collDir === "t") {
                player.yVelocity = 0;
            }
        }
        //render(boxes[i]);
    }

    //player.move();

    render(player);
    
    /*
    playerQuad = quadTree.findQuad(player);
    playerQuadObjects = playerQuad.objects;
    
    for(var i = 0; i < playerQuadObjects.length; i++) {
        //player.grounded = true;

        if(collisionChecker.quickBoxTest(player, playerQuadObjects[i])) {

            var collDir = collisionChecker.testCollision(player, playerQuadObjects[i]);

            if(collDir === "r" || collDir === "l" || player.y === (canvas.height - player.height)) {
                player.xVelocity = 0;
                player.jumping = false;
                player.doubleJumping = false;
                player.jumpCount = 0;
                //console.log("Player received a collision on the " + ((collDir === "r") ? "right" : "left") + "!");
            }
            if(collDir === "b") {
                player.grounded = true;
                player.yVelocity = 0;
                player.jumping = false;
                player.doubleJumping = false;
                player.jumpCount = 0;
                //console.log("Player received a collision on the bottom!");
            }
            if(collDir === "t") {
                player.yVelocity = 0;
            }
        }
        render(playerQuad.objects[i]);
    }

    //player.move();

    render(player);
    */
}

//Game function
function game() {
    update();
    setTimeout(function() {
        requestAnimationFrame(game);
    }, 1000 / FRAMERATE);
}
window.addEventListener("load", game);

//Helper functions
function clamp(value, min, max) {
    if(value > max)
        return max;
    else if(value < min)
        return min

        return value;
}

function render(object) {
    object.x = clamp(object.x, 0, canvas.width - object.width);
    object.y = clamp(object.y, 0, canvas.height - object.height);
    context.fillStyle = object.colour;
    context.fillRect(object.x, object.y, object.width, object.height, object.colour);
}

function check(object) {
    if(!object || object === null) {
        console.error(object.constructor.name + " is NULL.");
        return false;
    } else {
        //console.group("Properties of " + object.constructor.name + ": ");
        console.log(object.constructor.name + " has been created.")
        return true;
    }
}

var collisionChecker = {
    quickBoxTest: function(boxA, boxB) {
        if(boxA.x < boxB.x + boxB.width && boxA.x + boxA.width > boxB.x && boxA.y < boxB.y + boxB.height && boxA.height + boxA.y > boxB.y) {
            return true;
        }
        else
            return false;
    },

    //Credit to Obtuse Studios for this collision detection algorithm
    testCollision: function(objectA, objectB) {
        //Find the collision vectors
        var vectorX = (objectA.x + (objectA.width / 2)) - (objectB.x + (objectB.width / 2));
        var vectorY = (objectA.y + (objectA.height / 2)) - (objectB.y + (objectB.height / 2));

        //Find the distance between the two objects
        var deltaWidth = (objectA.width / 2) + (objectB.width / 2);
        var deltaHeight = (objectA.height / 2) + (objectB.height / 2);

        //Stores the direction of collision
        var collisionDir = null;

        //Check if the two objects are intersecting on the x and y axis
        if(Math.abs(vectorX) < deltaWidth && Math.abs(vectorY) < deltaHeight) {
            //The direction of collision
            var directionX = deltaWidth - Math.abs(vectorX);
            var directionY = deltaHeight - Math.abs(vectorY);

            //Check for vertical collision
            if(directionX >= directionY) {
                //Check for collisions from the top
                if(vectorY > 0) {
                    objectA.y += directionY;
                    collisionDir = "t";
                }

                //Collisions form the botttom
                else {
                    objectA.y -= directionY;
                    collisionDir = "b";
                }
            }
            else {
                //Check for collisions from the left
                if(vectorX > 0) {
                    objectA.x += directionX;
                    collisionDir = "l";
                }

                //Collisions form the right side
                else {
                    objectA.x -= directionX;
                    collisionDir = "r";
                }
            }
        }

        //Return the direction.
        return collisionDir;
    }
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//Input class
var input = {
    getKeyDown: function(keyToCheck) {
        if(heldKeys[keyToCheck] === true)
            return true
            else
                return false;
    }
}

//Holds some useful keycodes
var keyCode = {
    upArrow: 38,
    downArrow: 40,
    leftArrow: 37,
    rightArrow: 39,

    wKey: 87,
    aKey: 65,
    sKey: 83,
    dKey: 68,

    spacebarKey: 32
}

//Animation frame requests
function requestForAnimator() {
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                           timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());
}
