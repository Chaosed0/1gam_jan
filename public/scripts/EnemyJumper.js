
define(['crafty', './Expires'], function(Crafty) {
    Crafty.c("EnemyJumper", {
        _enemycomp: null,

        init: function () {
            this.requires("2D");
            this.requires("GravityFull");
            this.requires("Twoway");
        },

        enemyjumper: function (comp) {
            if (comp) this._enemycomp = comp;
            if(isNaN(this._jumpSpeed)) this._jumpSpeed = 0; //set to 0 if Twoway component is not present

            this.bind("Moved", this._moved);

            return this;
        },

       _moved: function () {
            //Check if we are intersecting an enemy
            var gotHit = this.hit(this._enemycomp);
            if (gotHit) {
                var collisionData = gotHit[0];
                var obj = collisionData.obj;

                //Make sure the object isn't dead already
                if(!obj.has("Expires")) {
                    if(this._gy > this._jumpSpeed && collisionData.normal.y < 0) {
                        //We hit the enemy from above, kill it and jump
                        this._gy = 0;
                        
                        //This is not scalable - figure out how to do this better
                        obj.animate("die")
                           .addComponent("Expires")
                           .expires(2000);
                    } else {
                        //We hit the enemy from somewhere else, we're dead
                    }
                }
            }
        },
    });
});
