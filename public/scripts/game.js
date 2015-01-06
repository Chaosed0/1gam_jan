
define(function(require) {
    var self = this;

    var Crafty = require('crafty');

    require('TiledMapMocks');
    require('TiledMapBuilder');

    var map = require('./map');
    
    var width = 320;
    var height = 320;
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
                "img/ground.png",
                "img/obstacles.png"
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
                                                                        
             Crafty.scene("Main");		
        });
    });
    
    Crafty.scene("Load");
                        
    Crafty.scene("Main", function () {
                                    
        console.log("MAIN");

        Crafty.e("2D, DOM, TiledMapBuilder").setMapDataSource(map)
            .createWorld( function( tiledmap ){
            
            //Obstacles
            for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('obstacles').length; obstacle++){
                tiledmap.getEntitiesInLayer('obstacles')[obstacle]
                    .addComponent("Collision")
                    .collision();							
            }
            
            //head1
            for (var head = 0; head < tiledmap.getEntitiesInLayer('head1').length; head++){
                tiledmap.getEntitiesInLayer('head1')[head]						
                .z = Math.floor(tiledmap.getEntitiesInLayer('head1')[head]._y + tiledmap.getEntitiesInLayer('head1')[head]._h);	
            }
            tiledmap.getEntitiesInLayer('head1')[0].z = Math.floor(tiledmap.getEntitiesInLayer('head1')[0]._y + 2*tiledmap.getEntitiesInLayer('head1')[0]._h);	
            tiledmap.getEntitiesInLayer('head1')[1].z = Math.floor(tiledmap.getEntitiesInLayer('head1')[1]._y + 2*tiledmap.getEntitiesInLayer('head1')[1]._h);
            
            //head2
            for (var head = 0; head < tiledmap.getEntitiesInLayer('head2').length; head++){
                tiledmap.getEntitiesInLayer('head2')[head]						
                .z = Math.floor(tiledmap.getEntitiesInLayer('head2')[head]._y + tiledmap.getEntitiesInLayer('head2')[head]._h);												
            }
            tiledmap.getEntitiesInLayer('head2')[0].z = Math.floor(tiledmap.getEntitiesInLayer('head2')[0]._y + 2*tiledmap.getEntitiesInLayer('head2')[0]._h);	
            tiledmap.getEntitiesInLayer('head2')[1].z = Math.floor(tiledmap.getEntitiesInLayer('head2')[1]._y + 2*tiledmap.getEntitiesInLayer('head2')[1]._h);																	
        });
                                                                                                                                    
        //Player
        Crafty.e("2D, DOM, Fourway, SpriteAnimation, Ogre, Collision")
            .attr({x: 150, y: 50, z: 10})
            .reel("idle", 1000, 0, 0, 1)
            .reel("walk_down", 500, 0, 0, 4)
            .reel("walk_left", 500, 0, 1, 4)
            .reel("walk_right", 500, 0, 2, 4)
            .reel("walk_up", 500, 0, 3, 4)
            .fourway(2)
            .collision( new Crafty.polygon([10,60],[40,60],[40,67],[10,67]) )
            .bind('Moved', function(from) {
                if( this.hit('obstacles') ){
                    this.attr({x: from.x, y:from.y});
                }							
                this.z = Math.floor(this._y + this._h);  
            })																
            .bind("NewDirection",
                function (direction) {
                    if (direction.x < 0) {
                        if (!this.isPlaying("walk_left"))
                            this.animate("walk_left", -1);
                    } else if (direction.x > 0) {
                        if (!this.isPlaying("walk_right"))
                            this.animate("walk_right", -1);
                    } else if (direction.y < 0) {
                        if (!this.isPlaying("walk_up"))
                            this.animate("walk_up", -1);
                    } else if (direction.y > 0) {
                        if (!this.isPlaying("walk_down"))
                            this.animate("walk_down", -1);
                    } else {
                        this.animate("idle");
                    }
            })  			   		
    });
});
