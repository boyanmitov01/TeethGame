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
var count=0;
var gameOver=true;
var restartSpeed=false;
var dead=false;
var leftVel=-1;
var rightVel=1;
var rightVelAdd=0;
var leftVelAdd=0;
var tilt=false;
var move=false;
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
    stateText = game.add.text(100, 100, " Game Over, \n Click 'R' to restart", { font: "100px Arial", fill: "#ff0000", align: "center" });
    stateText.fixedToCamera = true;
    stateText.cameraOffset.setTo(200, 200);
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
     socket.emit('create',game.id);
     // bullets = game.add.physicsGroup();
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(150, 'toothpaste');
    //bullets.setAll('checkWorldBounds', true);
//bullets.setAll('outOfBoundsKill', true);

    bads = game.add.group();
    //bads.enableBody = true;
   // bads.physicsBodyType = Phaser.Physics.ARCADE;



  //   game.physics.p2.
  game.cursors = game.input.keyboard.createCursorKeys();
 game.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
 game.r = game.input.keyboard.addKey(Phaser.Keyboard.R);


 socket.on('recInfo', function(x){
    if(x.rec==game.id){
        //bad = bads.create(x.x, x.y, 'bad', x.id);
        bad=bads.create(x.x, x.y, 'bad'); 
        bad.name =x.id;
        bad.angle=x.angle;
        game.physics.p2.enable(bad);
        game.physics.arcade.enable(bad);
        bad.body.mass=100;
    }
});

 socket.on('askInfo', function(x){
     console.log('someone is asking so for info');
    if(game.id==x.give){
        console.log('someone is asking me for info');
        socket.emit('recInfo',{'x': game.tooth.x,'y': game.tooth.y,'angle':game.tooth.angle,'id': game.id,'rec':x.ask})
    }

});

socket.on('rightTiltStart', function(id){
    var ex=false;
    if(game.id!==id){
        bads.forEach(function(item) {
            if(item.name===id){
                item.body.angularVelocity = 6;
                ex=true;
            }
        });
        if(!ex){
            console.log('should create new');
            socket.emit('askInfo',{'give':id,'ask':game.id});
        }
         
    }

});


socket.on('leftTiltStart', function(id){
    
    if(game.id!==id){
        bads.forEach(function(item) {
            if(item.name===id){
                console.log('tilt left');
                item.body.angularVelocity = -100;
            }
        });
    }

});


socket.on('tiltEnd', function(id){
    if(game.id!==id){
        bads.forEach(function(item) {
            if(item.name===id){
                item.body.angularVelocity = 0;
            }
        });
         
    }

});

socket.on('moveF', function(id){
    if(game.id!==id){
        bads.forEach(function(item) {
            if(item.name===id){
                item.moving=true;
                moving(item,18000);
            }
        });
         
    }

});

socket.on('moveB', function(id){
    if(game.id!==id){
        bads.forEach(function(item) {
            if(item.name===id){
                item.moving=true;
                moving(item,-18000);
            }
        });
         
    }

});

socket.on('moveRelease', function(id){
    if(game.id!==id){
        bads.forEach(function(item) {
            if(item.name===id){
                item.moving=false;
                console.log('release moving   ' +item.moving);
            }
        });
         
    }

});

socket.on('stopMove', function(id){
    if(game.id!==id){
        bads.forEach(function(item) {
            if(item.name===id){
                item.body.moveForward(0);
            }
        });
         
    }

});


    socket.on('shoot', function(id){
        bads.forEach(function(item) {
            
             if(item.name==id&&id!=game.id){
                 console.log("shoot");
                shootXY(item.angle,item.x,item.y,item);
                
             }
        });
    });

    socket.on('kill', function(id){
       
       bads.forEach(function(item) {
             if(game.id===id){
                 if(gameOver){
                     dead=true;
                    stateText.visible = true;
                    
                    restart();
                    dead=false;
                 }
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
     //game.paused = false;
    game.physics.arcade.overlap(bullets, bads, collisionHandler, null, this);


    if(game.r.isDown){
        restart();
    }

    if(restartSpeed){
        game.tooth.body.moveForward(0);
        restartSpeed=false;
    }

    
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
        if(!tilt){
            socket.emit('rightTiltStart',game.id);
        }
        tilt=true;
       dir='right';
       power=6;
    }

    if (game.cursors.left.isDown) {
        game.tooth.body.angularVelocity = -6;
       // if(!tilt){
            socket.emit('leftTiltStart',game.id);
       // }
        tilt=true;
         dir='left';
       power=-6;
    } 

     if (game.cursors.down.isDown) {
        if(stop1){
            game.tooth.body.moveForward(0);
            socket.emit('stopMove',game.id);
            
         }
        socket.emit('moveB',game.id);
        game.tooth.body.thrust(-18000);
         dir='backward';
       power=300;
       stop=true;
       stop1=false;
    } 
     if (game.cursors.up.isDown) {
        if(stop){
            game.tooth.body.moveForward(0);
            socket.emit('stopMove',game.id);
            
         }
        socket.emit('moveF',game.id);
        game.tooth.body.thrust(18000);
         dir='forward';
       power=300;
       stop=false;
       stop1=true;
    } 
    if (game.cursors.right.isUp&&game.cursors.left.isUp) {
        game.tooth.body.angularVelocity=0; 
        if(tilt){
            socket.emit('tiltEnd',game.id);
        }
        tilt=false;
        
        dir='right';
   
       power=0;
    }
    if (game.cursors.right.isUp&&game.cursors.left.isUp) {
        socket.emit('moveRelease',game.id);
    }
    
}


window.addEventListener("beforeunload", function (e) {
  var confirmationMessage = "\o/";
  gameOver=false;
  socket.emit('kill',game.id);
  (e || window.event).returnValue = confirmationMessage; 
  return confirmationMessage;                            
});

function send(x, y,angle,dir,power,id){
    socket.emit('changePos',{'x': x,'y': y,'angle':angle,'id': id});   
}

function shoot(angle){

    shootXY(angle,game.tooth.x,game.tooth.y,game.tooth);
    socket.emit('shoot',game.id);
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
function shootXY(angle,x,y,image){

    if (game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);
        var c
        if (bullet)
        {
            bullet.reset(x, y);
           
            bullet.lifespan = 2000;
            bullet.rotation = image.rotation;
            game.physics.arcade.velocityFromRotation(image.rotation+4.7, 1000, bullet.body.velocity);
            bulletTime = game.time.now + 50;
        
            
        }
    }
}

function restart () {

    //  A new level starts
    
    //resets the life count
   // lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    game.tooth.kill();
    bullets.removeAll();
    bads.removeAll();
    if(!game.r.isDown){
       
        
     restart();
    }
    bullets.removeAll();
    game.tooth.body.moveForward(0);
    
    bullets.createMultiple(150, 'toothpaste');
    bads.createMultiple(50, 'bad');

    //revives the player
    //game.tooth.revive();
    console.log("revive");
    game.tooth.body.moveForward(0);
   
    game.tooth=game.add.sprite(70, 70,"img");         
     game.physics.p2.enable(game.tooth);
     game.physics.arcade.enable(game.tooth);

    game.tooth.body.immovable = true;
    game.tooth.body.mass=100;
    game.tooth.angle=90;
     game.camera.follow(game.tooth);
     game.camera.follow(game.tooth, Phaser.Camera.FOLLOW_LOCKON);
    restartSpeed=true;
    //hides the text
    stateText.visible = false;
    gameOver=true;
    dead=false;
    return;
}

function moving(object,thrust){
   // console.log('thurst');
   // while(object.moving){
      // for(var i=0;i<10;i++){
        object.body.thrust(thrust);
        
     //  }
        //problem with body and shit like this!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //}
    console.log('end  thurst');
}

// function unpause(event){
//    // game.lockRender = true;
//     while(true){
//         if(game.paused){
//             game.input.mouse.capture = true;
//             console.log("paused");  
//             if(game.r.isDown){
//             restart();
//             break;
//         }
//     }
//     }
// }