
define(['crafty'], function(Crafty) {
    var enterFrame = function() {
        //if falling, accelerate
        this._gy += this._gravityConst;
        this.y += this._gy;
        this.trigger('Moved', { x: this._x, y: this._y - this._gy });
    };

    var moved = function() {
        var collisions = this.hit(this._anti);
        var gotHit = (collisions != false);

        //If we're intersecting, push the player out
        if (gotHit) {
            var data = collisions[0];
            //Add 1 to y so we're still hitting the obstacle;
            // otherwise, we alternate between falling/not falling
            // every frame
            this.x -= data.normal.x * data.overlap;
            this.y -= data.normal.y * data.overlap;
            this.trigger("Hit", data);
            if(data.normal.y < 0) {
                //If we were falling, stop falling
                this._falling = false;
                this._gy = 0;
                this._up = false;
            } else if(data.normal.y > 0) {
                //We hit a ceiling, start going down
                this._gy = this._jumpSpeed;
            }
        } else {
            this._falling = true;
        }
        this.z = Math.floor(this._y + this._h);
    };

    Crafty.c("GravityFull", {
        _gravityConst: 0.2,
        _gy: 0,
        _falling: true,
        _anti: null,

        init: function () {
            this.requires("2D");
            this.requires("Collision");
        },

        gravityfull: function (comp) {
            if (comp) this._anti = comp;
            if(isNaN(this._jumpSpeed)) this._jumpSpeed = 0; //set to 0 if Twoway component is not present

            this.bind("Moved", moved);
            this.bind("EnterFrame", enterFrame);

            return this;
        },

        gravityConst: function (g) {
            this._gravityConst = g;
            return this;
        },

        antigravity: function () {
            this.unbind("EnterFrame", this._enterFrame);
        }
    });
});
