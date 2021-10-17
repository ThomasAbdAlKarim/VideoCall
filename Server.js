var favicon = require('serve-favicon');
const express = require('express')
var path = require('path');
const app = express()

const port = 5000;
let Server = app.listen(port ,()=>console.log(`Listening on ${port}`));
const io = require('socket.io')(Server);
const { v4: uuidV4 } = require('uuid')
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs')
app.use(express.static('public'))
let RoomSet = new Set();
app.use(express.static('./public'))

app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'./public/Home.html')));
app.get('/404',(req,res)=>res.sendFile(path.join(__dirname,'./public/NoRoom.html')));

app.get('/:room', (req, res) => {
  if(RoomSet.has(req.params.room))
  {
    res.sendFile(path.join(__dirname,'./public/Call.html'))
  }
  else
  {
    res.redirect('/404');
  }
})

app.post('/NewRoom',(req,res)=>
{
    let Room = uuidV4();
    RoomSet.add(Room);
    res.redirect(`/${Room}`);
})

io.on('connection', (socket) => {
  socket.on('JoinRoom', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('UserConnected', userId)

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('UserDisconnected', userId)
    })
  })
})
