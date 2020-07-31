const chatFormContainer = document.getElementById('chat-form-container');
const chatForm = document.getElementById('chat-form');
const inputMsg = document.getElementById('msg');
const client = document.getElementById('client');
const worker = document.getElementById('worker');
const submitMsg = document.getElementById('submit');
const submitAudio = document.getElementById('submit-audio');
const btnRecord = document.getElementById('record');
const btnStop = document.getElementById('stop');
const exit = document.getElementById('exit');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, perfil } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

// Changing states
  // Input
  inputMsg.addEventListener('focus', () => {
  // To send
    submitMsg.style.background = "#2B76DE";
    submitMsg.style.opacity = "1";
  });

  inputMsg.addEventListener('focusout', () => {
  // Not to send
    submitMsg.style.background = "transparent";
    submitMsg.style.opacity = "0.65";
  });

  // Buttons
    // Recording
  btnRecord.addEventListener('focus', () => {
    btnRecord.style.color = "red";
  });

    // Not Recording
  btnRecord.addEventListener('focusout', () => {
    btnRecord.style.color = "#2B76DE";

  });
    // Stopped
  btnStop.addEventListener('focus', () => {
    btnRecord.style.color = "#2B76DE";
    submitAudio.style.background = "#2B76DE";
    submitAudio.style.color = "#ffffff";
    submitAudio.style.opacity = "1";
  });
  // Sended
  submitAudio.addEventListener('focus', () => {
    submitAudio.style.background = "transparent";
    submitAudio.style.color = "#2B76DE";
    submitAudio.style.opacity = "0.40";
  });


//------ Chat ------
const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, perfil });

// Get users
socket.on('Users', ({ users }) => {
  outputUsers(users);
});

// Welcome to User
socket.on('welcomeMessage', message => {                                                     
  if(perfil === "1"){
    outputMessage(message);                                                  
  }
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Show profile styles
socket.on('profile', profile => {                                                     
  console.log(profile);
  if(profile === '0'){//worker
    inputMsg.style.display = 'none';
    btnRecord.style.display = 'block';
    btnStop.style.display = 'block';
    worker.style.display = "none";
    client.style.display = "flex";
    chatFormContainer.style.borderTop = "1px solid #6098E6";
    chatFormContainer.style.backgroundColor = "transparent";
    submitAudio.style.display = 'block';
    submitAudio.style.opacity = "0.40";
    // Message submit 
    
  } else if(profile === '1') {//client
    inputMsg.style.display = 'block';
    btnRecord.style.display = 'none';
    btnStop.style.display = 'none';
    exit.style.display = 'none';
    worker.style.display = "flex";
    client.style.display = "none";
    submitMsg.style.display = 'block';
    // Message submit 
      chatForm.addEventListener('submit', e => {
        e.preventDefault();
      
        // Get message text
        const msg = e.target.elements.msg.value;
      
        // Emit message to server
        socket.emit('chatMessage', msg);
      
        // Clear input
        e.target.elements.msg.value = '';
        e.target.elements.msg.focus();
      });
  }
});

// Messages connected/disconnected users
socket.on('message', message => {                                                     
  console.log(message);
  outputMessage(message);                                                   

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

                                      
// chatForm.addEventListener('submit', e => {
//   e.preventDefault();

//   // Get message text
//   const msg = e.target.elements.msg.value;

//   // Emit message to server
//   socket.emit('chatMessage', msg);

//   // Clear input
//   e.target.elements.msg.value = '';
//   e.target.elements.msg.focus();
// });

// Output message to DOM
function outputMessage(message) {                  
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add users to DOM
function outputUsers(users) {
  console.log(users);
  users.map(user => {
    if(user.perfil !== '0'){
      userList.innerHTML = `${user.username}`;
    } else {
      roomName.innerHTML = `${user.username}`;
    }
  })
  
}

function __log(e, data) {
  log.innerHTML += "\n" + e + " " + (data || '');
}

//Message Recorded

var msgAudio;
var audio_context;
var recorder;
var boolTelaApagada = false;


function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);

  // Uncomment if you want the audio to feedback directly
  //input.connect(audio_context.destination);
  //__log('Input connected to audio context destination.');

  recorder = new Recorder(input);
}


function startRecording(button) {
  document.getElementById("demo").innerHTML = " ";
  recorder && recorder.record();
  button.disabled = true;
  button.nextElementSibling.disabled = false;

  console.log("Recording...");
}


function stopRecording(button) {

  recorder && recorder.stop();
  button.disabled = true;
  button.previousElementSibling.disabled = false;

  console.log("Stopped Recording");

  // create WAV download link using audio data blob
  createDownloadLink();

  recorder.clear();
}

function sendRecording(button){
    console.log("Clicou send");

    document.getElementById("demo").innerHTML = " ";

    recorder && recorder.send();

    console.log(msgAudio);
    socket.emit('chatMessage', msgAudio);
}

function createDownloadLink() { 

  recorder && recorder.exportWAV(function(blob) {

    // Define the FileReader which is able to read the contents of Blob
    var reader = new FileReader();

    reader.onload = async function(){

    // Since it contains the Data URI, we should remove the prefix and keep only Base64 string
    var b64 = reader.result.replace(/^data:.+;base64,/, '');
    console.log(b64); //-> "V2VsY29tZSB0byA8Yj5iYXNlNjQuZ3VydTwvYj4h"

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({wav:b64});

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    
    fetch("http://localhost:8080/json", requestOptions)
        .then(response => response.json())
        .then(result => document.getElementById("demo").innerHTML += result.texto )
        .then(result => {
          msgAudio=result;
        })
    .catch(error => console.log('error', error));
    };

    //Read the Blob and store the result as Data URL
    reader.readAsDataURL(blob);

  });

}

window.onload = function init() {
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;

      audio_context = new AudioContext;
    } catch (e) {
      alert('No web audio support in this browser!');
    }

    navigator.mediaDevices
      .getUserMedia({audio:true}).then ((stream) => startUserMedia(stream));
};
