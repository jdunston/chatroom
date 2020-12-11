const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userjoin,
  getcurrentuser,
  userleave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
 

const botname = "chatbot"
//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//run when client connects
io.on('connection' , socket =>{

    socket.on('joinRoom' , ({username , room})=>{


        const user = userjoin(socket.id , username, room) ; 
        socket.join(user.room) ; 

        //welcome user 
        console.log("New WS connection")
        socket.emit('message' , formatMessage(botname , 'Welcome !'));
    

        //broadcast when an user connect
        socket.broadcast.to(user.room).emit('message' , formatMessage(botname, `${user.username} join the chat` ));
    

    })
  
    //runs when a client disconnects 
    socket.on('disconnect' ,() => {

        const user = userleave(socket.id); 
      

        if(user){
            io.to(user.room).emit('message' ,  formatMessage(botname,  `${user.username} has left the chat`));
        }

    });
    
    // listen for chat message
    socket.on('chatMessage', (msg) =>{
        const user = getcurrentuser(socket.id);


        io.emit('message' , formatMessage(user.username,  msg));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=> console.log('Server running on port 3000' )); 