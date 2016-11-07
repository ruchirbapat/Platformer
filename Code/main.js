(function() 
{
    if (!window.requestAnimationFrame) 
    { 
        window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        
        function(callback, element) 
        {
            window.setTimeout(callback, 1000 / FRAME_RATE);
        }
    }
})();
console.log("Animation frame requested.");

var canvas = document.getElementById("canvas");
console.log("Canvas loaded.");
var context = (check(canvas)) ? canvas.getContext("2d") : null;
console.log("Context loaded.");
check(context);

canvas.style.background = "rgb(52, 55, 60)";
console.log("Background colour set to " + canvas.style.background + ".");

var boxes = [];
var heldKeys = [];
const FRAMERATE = 60;
const BOX_SIZE = 20;
const GRAVITY = 0.9;
const JUMP_VELOCITY = 10;
const SPEED = 10;
const ACCELERATION = 1;
const FRICTION = 0.9;

var playerSpawnX, playerSpawnY;
playerSpawnX = playerSpawnY = 0;
console.log("Values set for properties.");

player = new Player(0, 0, BOX_SIZE, BOX_SIZE, "white");
console.log("Player created.");
player.toString();
check(player);


for(var i = 0; i < 20; i++) {
   box = new Box(Math.floor((Math.random() * (canvas.width - BOX_SIZE))), Math.floor((Math.random() * (canvas.height - BOX_SIZE))), BOX_SIZE, BOX_SIZE, "red");
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
   
   //player.update();
   /*
   for(var i =0; i < boxes.length; i++)
      player.adjustVelocityByCollision(boxes[i]);
   */
   
   if(input.getKeyDown(keyCode.upArrow) || input.getKeyDown(keyCode.spacebarKey)) {
      if(!player.jumping && player.grounded) {
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
   
   context.clearRect(0, 0, canvas.width, canvas.height);
   
   for(var i = 0; i < boxes.length; i++) {
      
      player.grounded = false;
      
      var collDir = collisionChecker.testCollision(player, boxes[i]);
      
      if(collDir === "r" || collDir === "l") {
         player.xVelocity = 0;
         player.jumping = false;
         console.log("Player received a collision on the " + ((collDir === "r") ? "right" : "left") + "!");
      } else if(collDir === "b") {
         player.grounded = true;
         player.yVelocity = 0;
         player.jumping = false;
         console.log("Player received a collision on the bottom!");
      } else if(collDir === "t") {
         player.yVelocity = 0;
      }
      render(boxes[i]);
   }
   render(player);
}

function game() {
   update();
   requestAnimationFrame(game);
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
   object.x = clamp(object.x, 0, canvas.width - BOX_SIZE);
   object.y = clamp(object.y, 0, canvas.height - BOX_SIZE);
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
      if(boxA.x < boxB.x + boxB.width && boxA.x + boxA.width > boxB.x && boxA.y < boxB.y + boxB.height && boxA.height + boxA.y > boxB.y)
         return true;      
      
      return false;
   },
   
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
