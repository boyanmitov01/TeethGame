var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/*', function(req, res){
  res.sendfile('game'+req.url);
});

io.on('connection', function(socket){
  socket.on('create', function(x){
    io.emit('create', x);  
    console.log('server_create');
  });
  socket.on('leftTiltStart', function(x){
    io.emit('leftTiltStart', x);  
  });
  socket.on('rightTiltStart', function(x){
    io.emit('rightTiltStart', x);  
  });
  socket.on('tiltEnd', function(x){
    io.emit('tiltEnd', x);  
  });
  socket.on('moveF', function(x){
    io.emit('moveF', x);  
  }); 
  socket.on('moveB', function(x){
    io.emit('moveB', x);  
  }); 
  socket.on('moveRelease', function(x){
    io.emit('moveRelease', x);  
  }); 
  socket.on('stopMove', function(x){
    io.emit('stopMove', x);  
  }); 
  socket.on('recInfo', function(name){
    io.emit('recInfo', name);  
  });
  socket.on('askInfo', function(name){
    io.emit('askInfo', name);  
  });
  socket.on('changePos', function(name){
    io.emit('changePos', name);  
  });
  socket.on('kill', function(name){
    io.emit('kill', name);  
  });
  socket.on('shoot', function(name){
    io.emit('shoot', name);  
  });

});


http.listen(3000,'192.168.0.105', function(){
  console.log('listening on *:3000');
});