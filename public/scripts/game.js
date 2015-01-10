
define(['crafty', 'jquery', 'TiledMapBuilder', 'TiledMapMocks'
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
                    "map": { "Ogre": [0,0] }
                }
            }
        }
        
        //Preload assets first
        Crafty.load(assets, function() {
            Crafty.sprite(50,67,"img/ogre.png", {
                Ogre:[0,0]
            }); 

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
                        
    Crafty.scene("Main", function () {
                                    
        console.log("MAIN");

        Crafty.e("2D, Canvas, TiledMapBuilder").setMapDataSource(map)
            .createWorld(function(tiledmap) {
                //Platforms
                var platformTiles = tiledmap.getEntitiesInLayer('Platforms');
                for (var platform = 0; platform < platformTiles.length; platform++){
                    platformTiles[platform]
                        .addComponent("Collision")
                        .collision();							
                }

                //Set viewport bounds to map bounds
                var map = tiledmap.getSource();
                var bounds = { min: {x:0, y:0},
                   max: {x: map.width * map.tilewidth,
                         y: map.height * map.tileheight}
                };
                Crafty.viewport.bounds = bounds;
            });
                                                                                                                                    
        //Player
        var player = Crafty.e("2D, Canvas, Twoway, Gravity, SpriteAnimation, Ogre, Collision")
            .attr({x: 150, y: 50, z: 10})
            .reel("idle", 1000, 0, 0, 1)
            .reel("walk_down", 500, 0, 0, 4)
            .reel("walk_left", 500, 0, 1, 4)
            .reel("walk_right", 500, 0, 2, 4)
            .reel("walk_up", 500, 0, 3, 4)
            .twoway(6, 8)
            .collision( new Crafty.polygon([10,60],[40,60],[40,67],[10,67]) )
            .gravity('Platforms')
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
