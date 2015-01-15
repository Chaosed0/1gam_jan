
define(['crafty'], function(Crafty) {
    Crafty.c("GravityFull", {
        _gravityConst: 0.2,
        _gy: 0,
        _falling: true,
        _anti: null,

        init: function () {
            this.requires("2D");
        },

        gravityfull: function (comp) {
            if (comp) this._anti = comp;
            if(isNaN(this._jumpSpeed)) this._jumpSpeed = 0; //set to 0 if Twoway component is not present

            this.bind("EnterFrame", this._enterFrame);

            return this;
        },

        gravityConst: function (g) {
            this._gravityConst = g;
            return this;
        },

        _enterFrame: function () {
            if (this._falling) {
                //if falling, move the players Y
                this._gy += this._gravityConst;
                this.y += this._gy;
                this.trigger('Moved', { x: this._x, y: this._y - this._gy });
            } else {
                this._gy = 0; //reset change in y
            }

            //If, after falling, we're intersecting, push the player out
            var gotHit = this.hit(this._anti);
            if (gotHit) {
                var obj = gotHit[0];
                //Add 1 to y so we're still hitting the obstacle;
                // otherwise, we alternate between falling/not falling
                // every frame
                this.attr({x: this._x - obj.normal.x * obj.overlap,
                    y: this._y - obj.normal.y * obj.overlap + 
                        (obj.normal.y != 0 ? 1 : 0)});
                this.trigger("hit");
                if(obj.normal.y < 0) {
                    //If we were falling, stop falling
                    if(this._up) this._up = false;
                    this._falling = false;
                } else if(obj.normal.y > 0) {
                    //We hit a ceiling, start going down
                    this._gy = this._jumpSpeed;
                }
            } else {
                //Not hitting anything - keep falling
                this._falling = true;
            }
            this.z = Math.floor(this._y + this._h);
        },

        antigravity: function () {
            this.unbind("EnterFrame", this._enterFrame);
        }
    });
});
