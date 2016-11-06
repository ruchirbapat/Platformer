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

var canvas = document.getElementById("canvas");
console.log("Canvas loaded.");
var context = (check(canvas)) ? canvas.getContext("2d") : null;
console.log("Context loaded.");
check(context);

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

var collisionChecker= {
    quickBoxTest: function(boxA, boxB) {
        if(boxA.x < boxB.x + boxB.width && boxA.x + boxA.width > boxB.x && boxA.y < boxB.y + boxB.height && boxA.height + boxA.y > boxB.y)
         return true;      
      
      return false;
    }
}

var input = {
    getKeyDown: function(keyToCheck) {
        
    }
}
