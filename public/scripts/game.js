
define(function(require) {
    var self = this;

    var Crafty = require('crafty');
    
    var width = 1024;
    var height = 800;
    var gameElem = document.getElementById('game');

    Crafty.init(width, height, gameElem);
    Crafty.background('#EFEFEF');
});
