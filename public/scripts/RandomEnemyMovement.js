
define(['crafty', 'util'], function(Crafty, util) {

    var lowerMoveTime = 1000;
    var upperMoveTime = 5000;
    var lowerPauseTime = 2000;
    var lowerPauseTime = 8000;
    var defaultMoveSpeed = 4;

    var direction = {
        LEFT: 0,
        RIGHT: 1,
        END: 2
    };

    var enterFrame = function(data) {
        this._randomMoveTimer += data.dt;

        if(!this._moving && this._randomMoveTimer >= this._randomPauseTime) {
            this._randomMoveTimer = 0;
            this._moving = true;
            this._direction = Math.floor(util.getRandom(direction.END));
            this.trigger("NewDirection", this._direction);

            _randomMoveTime = util.getRandom(lowerMoveTime, upperMoveTime);
        } else if(this._moving && this._randomMoveTimer >= this._randomMoveTime) {
            this._randomMoveTimer = 0;
            this._moving = false;
            _randomPauseTime = util.getRandom(lowerMoveTime, upperMoveTime);
        }

        if(this._moving) {
            var savedPos = {x: this._x, y: this._y};
            if(this._direction == direction.LEFT) {
                this.x -= this._moveSpeed;
            } else {
                this.x += this._moveSpeed;
            }
            this.trigger("Moved",  { x: savedPos, y: savedPos});
        }
    };

    var onHit = function(data) {
        //If we hit something while moving, automatically start moving the other way
        if(data.normal.x != 0) {
            if(data.normal.x < 0) {
                this._direction = direction.LEFT;
            } else {
                this._direction = direction.RIGHT;
            }
            this.trigger("NewDirection", this._direction);
        }
    };
    
    var newDirection = function() {
        if(this._direction == direction.RIGHT) {
            this.flip("X");
        } else {
            this.unflip("X");
        }
    }

    Crafty.c("RandomEnemyMovement", {
        _randomMoveTimer: 0,
        _randomMoveTime: 0,
        _randomPauseTime: 0,
        _moving: false,
        _direction: direction.LEFT,
        _moveSpeed: defaultMoveSpeed,

        init: function () {
            this.requires("2D");

            this._randomPauseTime = util.getRandom(lowerMoveTime, upperMoveTime);
            this._randomMoveTime = util.getRandom(lowerMoveTime, upperMoveTime);
        },

        randomEnemyMovement: function (moveSpeed) {
            if(arguments.length > 0) {
                this._moveSpeed = moveSpeed;
            }

            this.bind("Hit", onHit);
            this.bind("EnterFrame", enterFrame);
            this.bind("NewDirection", newDirection);

            return this;
        },
    });
});
