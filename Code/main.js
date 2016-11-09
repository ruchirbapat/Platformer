var canvas = document.getElementById("canvas");
canvas.width = canvas.height = 750;
console.log("Canvas loaded.");
var context = (check(canvas)) ? canvas.getContext("2d") : null;
console.log("Context loaded.");
check(context);

canvas.style.background = "rgb(52, 55, 60)";
console.log("Background colour set to " + canvas.style.background + ".");

var boxes = [];
var heldKeys = [];
const FRAMERATE = 10000;
const BOX_SIZE = 20;
const GRAVITY = 0.984;
const JUMP_VELOCITY = 25;
const SPEED = 10;
const ACCELERATION = 1;
const FRICTION = 0.8;
const columns = Math.floor((canvas.height - BOX_SIZE) / BOX_SIZE);
const rows = Math.floor((canvas.width - BOX_SIZE) / BOX_SIZE);
const fillAmount = 5;

var level = new Array(columns);
for(var i = 0; i < level.length; i++)
    level[i] = new Array(rows);

check(level);

var playerSpawnX, playerSpawnY;
playerSpawnX = canvas.width / 2;
playerSpawnY = 0;
console.log("Values set for properties.");

player = new Player(playerSpawnX, playerSpawnY, BOX_SIZE * 2, BOX_SIZE * 2, "rgba(255, 100, 100, 1)");
console.log("Player created.");
player.toString();
check(player);

var box = new Box(0, canvas.height - BOX_SIZE, canvas.width, BOX_SIZE, "rgb(100, 100, 255)");

var boxTop = new Box(0, 0 - BOX_SIZE, canvas.width, BOX_SIZE, "rgb(100, 100, 255)");

for(var x = 0; x < columns; x++) {
    for(var y = 0; y < rows; y++) {
        if (x == 0 || x == ((canvas.width - BOX_SIZE)-1) || y == 0 || y == ((canvas.height - BOX_SIZE) - 1)) {
            level[x][y] = 1;
        } else {
            var randVal = randomNumber(0, 101);
            level[x][y] = ((randVal < fillAmount) ? 1 : 0);
        }
    }
}


/*
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
*/

/*
for (var x = 0; x < (canvas.width - BOX_SIZE); x ++) {
			for (var y = 0; y < (canvas.height - BOX_SIZE); y ++) {
				var neighbourWallTiles = GetSurroundingWallCount(x,y);

				if (neighbourWallTiles > 4)
					level[x][y] = 1;
				else if (neighbourWallTiles < 4)
					level[x][y] = 0;

			}
}
*/


for(var x = 1; x < columns; x++) {
    for(var y = 1  ; y < rows; y++) {
        console.log("The value at level[" + x + "][" + y + "] is " + level[x][y]);
    }
}

for(var x = 1; x < columns; x++) {
    for(var y = 1; y < rows; y++) {
        if(level[x][y] === 1)
            box = new Box(x * columns, y * rows, BOX_SIZE, BOX_SIZE, "rgb(100, 100, 255)")
            }
}


requestForAnimator();

console.log("Animation frame requested.");

function GetSurroundingWallCount(gridX, gridY) {
    var wallCount = 0;
    for(var neighbourX = gridX - 1; neighbourX <= gridX + 1; neighbourX++) {
        for(var neighbourY = gridY - 1; neighbourY <= gridY + 1; neighbourY++) {
            if(neighbourX >= 0 && neighbourX < (canvas.width - BOX_SIZE) && neighbourY >= 0 && neighbourY < (canvas.height - BOX_SIZE)) {
                if(neighbourX != gridX || neighbourY != gridY) {
                    wallCount += level[neighbourX][neighbourY];
                }
            } else {
                wallCount++;
            }
        }
    }

    return wallCount;
}

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

        player.xVelocity *= FRICTION;
        player.yVelocity += GRAVITY;

        player.y += player.yVelocity;
        player.x += player.xVelocity;
    }

    this.render = function() {
        context.fillStyle = this.colour;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}


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
}

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

    player.xVelocity *= FRICTION;
    player.yVelocity += GRAVITY;

    player.y += player.yVelocity;
    player.x += player.xVelocity;

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
}

function game() {
    update();
    setTimeout(function() {
        requestAnimationFrame(game);
    }, 1000 / FRAMERATE);
}
window.addEventListener("load", game);


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
            //console.log("Quick Box Test between " + boxA.constructor.name + " and " + boxB.constructor.name + " returned true.");
            return true;
        }
        else
            //console.log("Quick Box Test between " + boxA.constructor.name + " and " + boxB.constructor.name + " returned false.");

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
        if(Math.abs(vectorX) < deltaWidth && Math.abs(vectorY) < deltaHeight)
        {
            //The direction of collision
            var directionX = deltaWidth - Math.abs(vectorX);
            var directionY = deltaHeight - Math.abs(vectorY);

            //Check for vertical collision
            if(directionX >= directionY)
            {
                //Check for collisions from the top
                if(vectorY > 0)
                {
                    objectA.y += directionY;
                    collisionDir = "t";
                }

                //Collisions form the botttom
                else
                {
                    objectA.y -= directionY;
                    collisionDir = "b";
                }
            }
            else
            {
                //Check for collisions from the left
                if(vectorX > 0)
                {
                    objectA.x += directionX;
                    collisionDir = "l";
                }

                //Collisions form the right side
                else
                {
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

var input = {
    getKeyDown: function(keyToCheck) {
        if(heldKeys[keyToCheck] === true)
            return true
            else
                return false;
    }
}

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
