const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const DataStore = require('nedb')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')      // to generate randomid-----------------not needed can be deleted

const database = new DataStore('database.db');
database.loadDatabase();

app.use('/peerjs', peerServer);


app.set('view engine', 'ejs')               //sets the view enjine to ejs
app.use(express.static('public'))           //----what is this used for---------ans> somehow linking to the public folder
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {                //redirecting to a perticular  room with a perticular id
  res.render('login')
  // res.redirect(`/${uuidV4()}`)              //----*****change this to get into different rooms*****------
})


// testing an idea
// app.get('/',(req,res)=>{
//   res.render('myForm')
// })

// app.get('/test',(req,res)=>{
//   const data = req.query.data;
//   res.render('test',{data:data})
// })

app.post('/enter',(req,res)=>{
  console.log('user entered')
  console.log(req.body);
  const data = req.body;
  database.insert(data);

  
  res.redirect(`${data.room}`)
 
})

app.post('/nav', (req,res)=>{
  console.log(`changing room to ${req.body.nextRoom}`)
  res.redirect(`/${req.body.nextRoom}`)
})

app.get('/:room', (req, res) => {                     // using the link sending the roomid to room.ejs file
  //check if the persion is allowed ti the room
  
  res.render('room', { roomId: req.params.room })

})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId) 
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||3000)
