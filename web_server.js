var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/*', function(req, res){
  res.sendfile('game'+req.url);
});

io.on('connection', function(socket){
  socket.on('changePos', function(x){
    io.emit('changePos', x);  
  });
  socket.on('kill', function(name){
    io.emit('kill', name);  
  });
  socket.on('shoot', function(name){
    io.emit('shoot', name);  
  });

});


http.listen(3000,'192.168.0.103', function(){
  console.log('listening on *:3000');
});