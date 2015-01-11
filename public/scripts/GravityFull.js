
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
            this.bind("Moved", this._moved);

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
        },

        _moved: function(oldpos) {
            var gotHit = this.hit(this._anti);
            if (gotHit) {
                var obj = gotHit[0];
                if (this._y > oldpos.y) {
                    if(this._up) this._up = false;
                    this._falling = false;
                }
                this.attr({x: this._x - obj.normal.x * obj.overlap,
                    y: this._y - obj.normal.y * obj.overlap});
                this.trigger("hit");
            } else if(!gotHit) {
                this._falling = true; //keep falling otherwise
            }
            this.z = Math.floor(this._y + this._h);
        },

        antigravity: function () {
            this.unbind("EnterFrame", this._enterFrame);
        }
    });
});
