var game = new Phaser.Game(900, 600, Phaser.CANVAS, 'Demo', {preload: preload, create: create, update: update });
var socket = io();
var teeth=new Map();
var keys=[];
var dir;
var power;
function preload (){
    game.id=Math.floor(Math.random() * 1000);
    
    game.load.image('img', '1.png');
    game.load.image('bad', 'bad.png');
    game.load.image('tileset', 'tileset1.png');
    game.load.tilemap('map', 'space1.json', null, 
    Phaser.Tilemap.TILED_JSON);

}
function create (){
    game.stage.backgroundColor = '555';
    game.world.setBounds(0, 0, 960, 960);
     game.physics.startSystem(Phaser.Physics.P2JS);
     game.physics.p2.gravity.y = 0;
     game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    var map = game.add.tilemap('map');
    map.addTilesetImage('tileset');
     map.setCollision([181]);
      game.physics.p2.setImpactEvents(true);
    var layer=map.createLayer('\u0421\u043b\u043e\u0439 \u0441 \u043f\u043b\u043e\u0447\u043a\u0438 1');
    layer.resizeWorld();
    game.physics.p2.convertTilemap(map, layer);
  game.physics.p2.setBoundsToWorld(false, false, false, false, false);

//   var layer = map.createLayer('Tile Layer 1');
//   layer.resizeWorld();
//   game.physics.p2.convertTilemap(map, layer);
//tooth
    game.tooth=game.add.sprite(70, 70,"img");         
     game.physics.p2.enable(game.tooth);
   //  game.tooth.anchor.setTo(0.5, 0.5);
     game.tooth.angle=50;
     keys[0]=game.id;
     teeth.set(game.id,{'x': game.tooth.x,
    'y': game.tooth.y,
    'angle':game.tooth.body.angle ,
    'id': game.id,
    'image':game.tooth});
    // game.tooth.body.moveRight(300);
    // game.player.events.onOutOfBounds.add(succed, this);
     game.camera.follow(game.tooth);
     game.camera.follow(game.tooth, Phaser.Camera.FOLLOW_LOCKON);
     game.physics.p2.
    //  teeth[game.id] = {
    //   'x':  game.tooth.x,
    //   'y': game.tooth.y
    // }

  game.cursors = game.input.keyboard.createCursorKeys();
  socket.on('changePos', function(x){
      var image;
      var x,y;
        if(teeth.has(x.id)==false){
            console.log("new");
           // if(x.id!=game.id){
                //image=game.tooth;
                
                image=game.add.sprite(x.x, x.y,"bad");
               // game.physics.p2.enable(image);
                 game.tooth.body.createBodyCallback(image, collide, game);
                 
            
            keys[keys.length]=x.id;
            teeth.set(x.id,{'x': x.x,
            'y': x.y,
            'angle':x.angle ,
            'id': x.id,
            'image':image});
               
                teeth.get(x.id).image=image;
               // game.physics.p2.enable(teeth.get(x.id).image);
                teeth.get(x.id).image.angle=x.angle;
                teeth.get(x.id).image.x=x.x;
                teeth.get(x.id).image.y=x.y;
           //}
                // if(x.id!=game.id){
                //      moveBad(x);
                // }
        }else if(teeth.has(x.id)==true){
            if(x.id!=game.id){
                console.log("old");
                teeth.set(x.id,{'x': x.x,
                'y': x.y,
                'angle':x.angle ,
                'id': x.id,
                'image':teeth.get(x.id).image});
                teeth.get(x.id).image.angle=x.angle;
                teeth.get(x.id).image.x=x.x;
                teeth.get(x.id).image.y=x.y;
                // if(x.id!=game.id){
                //      moveBad(x);
                //     console.log("move");
                // }
            }
               
            
        }
    });

    socket.on('kill', function(id){
        if(teeth.has(id)==true){
        teeth.get(id).image.visible=false;
        teeth.get(id).pop();
        }
           // game.physics.p2.unable(teeth.get(id).image);
          //  teeth.get(id).image.alpha=0;
        //teeth.delete(id);
    });
   //  img.body.moveRight(300);
}
function update (){
    // teeth.forEach(function(item,key,mapObj){
    //   //  sprite.destroy(key);      
    //   if(key!=game.id){
    //   console.log(mapObj[key].angle);
    //     mapObj[key].image.angle=mapObj[key].angle;
    //     //console.log(mapObj[key].image.angle);
    //     mapObj[key].image.x=mapObj[key].x;
    //     mapObj[key].image.y=mapObj[key].y;      
    // }

    // });


    if (game.cursors.right.isDown) {
        game.tooth.body.angularVelocity = 6;
       dir='right';
       power=6;
    }
    if (game.cursors.left.isDown) {
        game.tooth.body.angularVelocity = -6;
         dir='left';
       power=-6;
    } 
     if (game.cursors.down.isDown) {
        game.tooth.body.moveBackward(300);
         dir='backward';
       power=300;
    } 
     if (game.cursors.up.isDown) {
        game.tooth.body.moveForward(300);
         dir='forward';
       power=300;
    } 
    if (game.cursors.right.isUp&&game.cursors.left.isUp) {
        game.tooth.body.angularVelocity=0; 
        dir='right';
       power=0;
    }
    // teeth.forEach(function(item,key,mapObj){
    //     console.log("in");
    // });
    // console.log("out");
    // console.log(keys.length);
    // for(i=0;i<keys.length;i++){
    //    console.log("in");
    //    var x=teeth.get(keys[i]).x;
    //    var y=teeth.get(keys[i]).y;
    //     var angle=teeth.get(keys[i]).angle;
    //    var id= teeth.get(keys[i]).id;
    //    if(game.id!=teeth.get(keys[i]).id){
    //         send(x,y,angle,null,null,id);
    //    }else{
    //         send(x,y,angle,dir,power,id);
    //          console.log("in");
    //    }
    // }
    //  console.log("out");
    send(game.tooth.x,game.tooth.y,game.tooth.angle,null,null,game.id);
}


window.addEventListener("beforeunload", function (e) {
  var confirmationMessage = "\o/";
  socket.emit('kill',game.id);
  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage;                            //Webkit, Safari, Chrome
});

function succeed(){
    location.reload();
}
function send(x, y,angle,dir,power,id){
    socket.emit('changePos',{'x': x,'y': y,'angle':angle,'dir':dir,'power':power ,'id': id});   
}
function getEmits(){
   
}

function moveBad(x){
    if(x.dir!=null){
        if (x.dir=='right') {
           // teeth.get(x.id).image.body.angle = ;
        }
        if (x.dir=='left') {
           // teeth.get(x.id).image.body.angle = x.power;
        } 
        if (x.dir=='backward') {
            teeth.get(x.id).image.body.moveBackward= x.power;
        } 
        if (x.dir=='forward') {
            teeth.get(x.id).image.body.moveForward= x.power;
         } 
    }
    // teeth.get(x.id).image.angle=x.angle;
    // teeth.get(x.id).image.x=x.x;
    // teeth.get(x.id).image.y=x.y;
}

function collide(){

    console.log("colision")
}