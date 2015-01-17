
define(['crafty', 'jquery', 'TiledMapBuilder', 'TiledMapMocks',
        './GravityFull',
        './EnemyJumper'
    ], function(Crafty, $) {
    var self = this;
    var map;
    
    var width = 800;
    var height = 600;
    var gameElem = document.getElementById('game');

    Crafty.init(width, height, gameElem);  			  		
    Crafty.scene("Load", function() {

        console.log("LOAD");
        
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({ w:width, h: 20, x: 0, y: height/2 })
                .text("Loading...")
                .css({ "text-align": "center" });

        var assets = {
            "images": [
                "img/tiles_spritesheet.png"
            ],
            "sprites": {
                "img/ogre.png": {
                    "tile": 50,
                    "tileh": 67,
                    "map": { "Ogre": [0,0] }
                },
                "img/slime.png": {
                    "tile": 60,
                    "tileh": 36,
                    "map": { "Slime": [0,0] }
                }
            }
        }
        
        //Preload assets first
        Crafty.load(assets, function() {
            $.ajax({
                url:'/maps/untitled.json',
                cache: false,
                dataType: 'json',
                type: 'GET',
                success: function(data) {
                    map = data;
                    Crafty.scene("Main");		
                },
                error: function(error) {
                    console.log('some error happened getting the map');
                }
            });
        });
    });
    
    Crafty.scene("Load");

    var makeSlime = function(pos) {
        return Crafty.e("2D, Canvas, GravityFull, SpriteAnimation, Slime, Collision, Enemy")
            .attr({x: pos.x, y: pos.y})
            .reel("idle", 750, 0, 0, 10)
            .reel("die", 500, 0, 1, 5)
            .animate("idle", -1)
            .gravityfull("Platforms")
            .collision();
    };
                        
    Crafty.scene("Main", function () {
                                    
        console.log("MAIN");
        var playerSpawnLoc = {x: 150, y:50};

        Crafty.e("2D, Canvas, TiledMapBuilder").setMapDataSource(map)
            .createWorld(function(tiledmap) {
                //Platforms
                var platformTiles = tiledmap.getEntitiesInLayer("Platforms");
                for (var i = 0; i < platformTiles.length; i++){
                    platformTiles[i]
                        .addComponent("Collision")
                        .collision();							
                }

                //Objects
                var objects = tiledmap.getEntitiesInLayer("Objects");
                for (var i = 0; i < objects.length; i++) {
                    var object = objects[i];
                    var objectCenter = { x: object.x + object.w / 2.0,
                                         y: object.y + object.h / 2.0 };
                    console.log(objectCenter);
                    if(object.has("PlayerSpawn")) {
                        playerSpawnLoc = objectCenter;
                    } else if(object.has("SlimeSpawn")) {
                        var slime = makeSlime(objectCenter);
                    } else {
                        console.log("WARNING: Found unknown object ", object);
                    }
                }

                //Set viewport bounds to map bounds; if we let it auto-clamp to entities,
                // the number of entities that TiledMapBuilder creates destroys framerate
                var map = tiledmap.getSource();
                var bounds = { min: {x:0, y:0},
                   max: {x: map.width * map.tilewidth,
                         y: map.height * map.tileheight}
                };
                Crafty.viewport.bounds = bounds;
            });
                                                                                                                                    
        //Player
        var player = Crafty.e("2D, Canvas, Twoway, GravityFull, SpriteAnimation, Ogre, Collision, EnemyJumper")
            .attr({ x: playerSpawnLoc.x, y: playerSpawnLoc.y, z: 10 })
            .reel("idle", 1000, 0, 0, 1)
            .reel("walk_down", 500, 0, 0, 4)
            .reel("walk_left", 500, 0, 1, 4)
            .reel("walk_right", 500, 0, 2, 4)
            .reel("walk_up", 500, 0, 3, 4)
            .twoway(6, 8)
            .collision()
            .gravityfull('Platforms')
            .enemyjumper('Enemy')
            .bind("NewDirection", function (direction) {
                    if (direction.x < 0) {
                        if (!this.isPlaying("walk_left"))
                            this.animate("walk_left", -1);
                    }
                    if (direction.x > 0) {
                        if (!this.isPlaying("walk_right"))
                            this.animate("walk_right", -1);
                    }
                    if (direction.y < 0) {
                        if (!this.isPlaying("walk_up"))
                            this.animate("walk_up", -1);
                    }
                    if (direction.y > 0) {
                        if (!this.isPlaying("walk_down"))
                            this.animate("walk_down", -1);
                    } 
                    if(direction.x == 0 && direction.y == 0) {
                        this.animate("idle");
                    }
            });
        Crafty.viewport.follow(player, 0, 0);
    });
});
