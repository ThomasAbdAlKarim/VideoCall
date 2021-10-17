let Socket = io('/');

const MyPeer = new Peer(undefined,{
  host:'localhost',
  port:'3001',
  path: '/'
});
const Room = window.location.pathname.substring(1);
const VideoGrid = document.getElementById("VideoGrid");

let Users = {}

const MyVid = document.createElement('video');
MyVid.muted = true;

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true,    
}).then((Stream)=>{

    SetupVidStream(MyVid,Stream)

    MyPeer.on('call',(call)=>
    {
        call.answer(Stream);
        const video = document.createElement('video')
        call.on('stream',(UserStream)=>
        {
            SetupVidStream(video,UserStream)

        })
        call.on('close', () => {
            video.remove()
          })
    })

    Socket.on("UserConnected",(UserId)=>
    {
        setTimeout(ConnectNewUser,1000,UserId,Stream)
    })
    
});

MyPeer.on('open', (Id)=>
{
    Socket.emit("JoinRoom",Room,Id);
})




document.getElementById("Leave").addEventListener("click",(e)=>{window.location.href = "/"})

function SetupVidStream(Video,Stream)
{
    Video.srcObject = Stream;
    Video.addEventListener('loadedmetadata',() => {
        Video.play();
    })
    Video.classList.add("vid")
    VideoGrid.append(Video)
}


function ConnectNewUser(userId, stream) 
{
    const call = MyPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream',(UserStream)=>
    {
       SetupVidStream(video,UserStream)
    })
    call.on('close', () => 
    {
        video.remove()
    })
    Users[userId] = call;
}

Socket.on('UserDisconnected',(UserId)=>
{
    if(Users[UserId])
    {
        Users[UserId].close();
    }
})