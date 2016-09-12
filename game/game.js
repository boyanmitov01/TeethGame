var game = new Phaser.Game(1200, 800, Phaser.CANVAS, 'Demo', {preload: preload, create: create, update: update });
var socket = io();
var teeth=new Map();
var keys=[];
var dir;
var power;
var stop=false;
var stop1=false;
var shot=false;
var fireRate = 100;
var nextFire = 0;
var bulletTime = 0;
var stateText;
function preload (){
    game.id=Math.floor(Math.random() * 1000);
    
    game.load.image('img', '1.png');
    game.load.image('bad', 'bad.png');
    game.load.image('tileset', 'tileset1.png');
    game.load.image('toothpaste', 'toothpaste.png');
    game.load.tilemap('map', 'space2.json', null, 
    Phaser.Tilemap.TILED_JSON);

}
function create (){
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '555';
    game.world.setBounds(0, 0, 9600, 9600);
     game.physics.startSystem(Phaser.Physics.P2JS);
     game.physics.p2.gravity.y = 0;
     game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    var map = game.add.tilemap('map');
    map.addTilesetImage('tileset');
     map.setCollision([54]);
      game.physics.p2.setImpactEvents(true);
    var layer=map.createLayer('\u0421\u043b\u043e\u0439 \u0441 \u043f\u043b\u043e\u0447\u043a\u0438 1');
    layer.resizeWorld();
    game.physics.p2.convertTilemap(map, layer);
  game.physics.p2.setBoundsToWorld(false, false, false, false, false);

    game.tooth=game.add.sprite(70, 70,"img");         
     game.physics.p2.enable(game.tooth);
     game.physics.arcade.enable(game.tooth);

    game.tooth.body.immovable = true;
    game.tooth.body.mass=100;
     game.tooth.angle=50;
     keys[0]=game.id;
     teeth.set(game.id,{'x': game.tooth.x,
    'y': game.tooth.y,
    'angle':game.tooth.body.angle ,
    'id': game.id,
    'image':game.tooth});
     game.camera.follow(game.tooth);
     game.camera.follow(game.tooth, Phaser.Camera.FOLLOW_LOCKON);
     // bullets = game.add.physicsGroup();
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(50, 'toothpaste');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    bads = game.add.group();
    bads.enableBody = true;
    bads.physicsBodyType = Phaser.Physics.ARCADE;


  //   game.physics.p2.
  game.cursors = game.input.keyboard.createCursorKeys();
 game.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);



  socket.on('changePos', function(x){
    var bad;
    var exists=false;

    if(game.id!==x.id){
        bads.forEach(function(item) {
            if(item.name===x.id){
                console.log("old");
                item.x=x.x;
                item.y=x.y;
                item.angle=x.angle;
                exists=true;
            }
        });
        if(!exists){
            console.log("new");
            bad = bads.create(70, 70, 'bad', x.id);
            bad.name =x.id;
         }
    }

});

    socket.on('kill', function(id){
       
        bads.forEach(function(item) {
             if(game.id===id){
                console.log("dead");
                stateText.text = " Game Over, \n Click to restart";
                stateText.visible = true;
             }else if(item.name===id){
             console.log("  "+id+"   "+game.id);               
                item.x=20;
                item.y=20;
                item.kill();
                bads.remove(item); 
             }
            });
    
    });
   
}
function update (){
    
     //teeth.forEach(function(item,key,mapObj){
         
     //game.physics.arcade.overlap(teeth.image, bullets, collisionHandler, processHandler, this);
    //  for(i =0;i<keys.length;i++){
         //console.log(teeth.get(keys[0]).image.angle);
        game.physics.arcade.overlap(bullets, bads, collisionHandler, null, this);
    //  }
   
   //  });


     if (game.spaceKey.isDown) {
        shot=true;
    }
    if(game.spaceKey.isUp){
        if(shot){
            shoot(game.tooth.angle);
        }
        shot=false; 
    }
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
       if(stop1){
        game.tooth.body.moveForward(0);
         }
        
        game.tooth.body.thrust(-18000);
         dir='backward';
       power=300;
       stop=true;
       stop1=false;
    } 
     if (game.cursors.up.isDown) {
         if(stop){
        game.tooth.body.moveForward(0);
         }

        game.tooth.body.thrust(18000);
         dir='forward';
       power=300;
       stop=false;
       stop1=true;
    } 
    if (game.cursors.right.isUp&&game.cursors.left.isUp) {
        game.tooth.body.angularVelocity=0; 
        dir='right';
   
       power=0;
    }

    send(game.tooth.x,game.tooth.y,game.tooth.angle,null,null,game.id);
}


window.addEventListener("beforeunload", function (e) {
  var confirmationMessage = "\o/";
  socket.emit('kill',game.id);
  (e || window.event).returnValue = confirmationMessage; 
  return confirmationMessage;                            
});

function send(x, y,angle,dir,power,id){
    socket.emit('changePos',{'x': x,'y': y,'angle':angle,'dir':dir,'power':power ,'id': id});   
}

function collide(){

    console.log("colision")
}
function shoot(angle){

    if (game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);
        var c
        if (bullet)
        {
            bullet.reset(game.tooth.body.x, game.tooth.body.y);
           //bullet.body.mass=-100;
           //console.log(teeth.get(0).image)
           
            bullet.lifespan = 2000;
            bullet.rotation = game.tooth.rotation;
            game.physics.arcade.velocityFromRotation(game.tooth.rotation+4.7, 1000, bullet.body.velocity);
            bulletTime = game.time.now + 50;
            //game.physics.p2.enable(bullet);
        }
    }
}

function deathHandler(){
    console.log("dead");
}
function processHandler (bad, bullet) {

    return true;

}

function collisionHandler (bullet, bad) {
    
    if(bad.name==game.id){
        console.log("collision with me");
    }else{
        
        console.log("colision with bad:"+bad.angle+" "+game.tooth.angle);
        socket.emit('kill',bad.name);
        bullet.x=10;
        bullet.y=10;
        bullet.kill();
        bullets.remove(bullet)
        bad.x=20;
        bad.y=20;
       bad.kill();
       bads.remove(bad);                  
    }
    

}