let globalStream;
let isVideoEnable = true;
let isAudioEnable = true;

let hostId = "123"

let client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "h264"
})

let screenClient = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
})

let hostIds = {};

let remoteStreams = {};

let localStreams = {
  camera: {
    id: "",
    stream: {}
  },
  screen: {
    id: "",
    stream: {}
  }
};

let mainStreamId;

let options = {
  role: null
}

let handlefail = function(err) {
  console.log(err);
}

function addVideoStream(streamId) {
  console.log("Adding Video")
  let remoteContainer = document.getElementById("remoteStreams");
  let streamDiv = document.createElement("div");
  streamDiv.id = streamId;
  streamDiv.classList.add("remoteStream");
  remoteContainer.appendChild(streamDiv);
}

function addHostStream(id) {
  hostIds["id"] = id;
  hostIds["screenId"] = id + "screen";
  remoteStreams[id].play("HostStream");
}

function addHostScreenStream(id) {
  remoteStreams[id].play("ScreenStream")
}

function addParticipant(name) {
  console.log(options.role)
  if (options.role == 'host' && name.includes("Me") || name.includes("Host")) {
    let stream = document.getElementById("right-pane");
    let nameSpan = document.createElement("span");
    let getVideo = document.getElementById("hostStream");
    // let divSpan = document.createElement("div");
    nameSpan.id = name + "-name";
    nameSpan.classList.add("heading-text");
    nameSpan.innerText = name;
    stream.insertBefore(nameSpan, getVideo);
  } else if (name.includes("Me")) {
    let streams = document.getElementById(name.substring(0, name.lastIndexOf(" ")));
    let nameSpan = document.createElement("span");
    nameSpan.id = name + "-name";
    nameSpan.innerText = name;
    streams.append(nameSpan);
  } else {
    console.log("hello");
    // let participants = document.getElementById("participants");
    let streams = document.getElementById(name)
    let nameSpan = document.createElement("span");
    // let divSpan = document.createElement("div");
    nameSpan.id = name + "-name";
    // nameSpan.classList.add("heading-text");
    nameSpan.innerText = name;
    streams.append(nameSpan);
  }
}

function deleteParticipant(name) {
  if (name.includes(hostId) ) {
    let pane = document.getElementById("right-pane");
    let child = document.getElementById(name + " (Host)-name");
    pane.remove(child);
  } else {
    let remote = document.getElementById("remoteStreams");
    let divSpan = document.getElementById(name + "-name");
    console.log(divSpan);
    if (divSpan === null) {
      divSpan = document.getElementById(name + " (Host)-name");
    }
    remote.removeChild(divSpan);
  }
}

function addLeaveHost() {
  let pane = document.getElementsByClassName("left-pane");
  let button = document.createElement("button");
  button.id = "leave";
  button.textContent = "Leave";
  pane[0].insertBefore(button, document.getElementById("player"));
  document.getElementById("leave").onclick = async function () {
    remoteStreams = {};
    await client.leave();
    await screenClient.leave();
    localStreams.camera.stream.close();
    localStreams.screen.stream.close();
    localStreams.camera.stream.stop();
    localStreams.screen.stream.stop();
    document.getElementById("remoteStreams").innerHTML = "";
    document.getElementById("HostStream").innerHTML = "";
    document.getElementById("ScreenStream").innerHTML = "";
    document.getElementsByClassName("left-pane")[0].removeChild(document.getElementById("leave"));
  }
}

function addLeave() {
  let pane = document.getElementsByClassName("left-pane");
  let button = document.createElement("button");
  button.id = "leave";
  button.textContent = "Leave";
  pane[0].insertBefore(button, document.getElementById("player"));
  document.getElementById("leave").onclick = async function () {
    remoteStreams = {};
    await client.leave();
    localStreams.camera.stream.close();
    localStreams.camera.stream.stop();
    document.getElementById("remoteStreams").innerHTML = "";
    document.getElementById("HostStream").innerHTML = "";
    document.getElementById("ScreenStream").innerHTML = "";
    document.getElementsByClassName("left-pane")[0].removeChild(document.getElementById("leave"));
  }
}

async function getAppId() {
  let data = await fetch('https://mighty-beyond-51224.herokuapp.com/access_token/appid')
    .then(response => response.json())
    .then(dataResponse => dataResponse.appid);
  return data;
}

async function getToken(channelName, uid) {
  let token = await fetch(`https://mighty-beyond-51224.herokuapp.com/access_token?channelName=${channelName}&uid=${uid}`)
    .then(response => response.json())
    .then(dataResponse => dataResponse.token);
  return token;
}

document.getElementById("MAudio").onclick = function () {
  if (isAudioEnable) {
    localStreams.camera.stream.muteAudio();
    isAudioEnable = false;
  } else {
    localStreams.camera.stream.unmuteAudio();
    isAudioEnable = true;
  }
}

document.getElementById("MVideo").onclick = function () {
  if (isVideoEnable) {
    localStreams.camera.stream.muteVideo();
    isVideoEnable = false;
  } else {
    localStreams.camera.stream.unmuteVideo();
    isVideoEnable = true;
  }
}

document.getElementById("join").onclick = async function () {
  let channelName = document.getElementById("channelName").value;
  let Username = document.getElementById("username").value;
  let getRole = document.getElementsByName("hostType");

  for (let radio of getRole) {
    if (radio.checked) {
      options.role = radio.value;
    }
  }

  let appId = await getAppId();
  client.init(appId, () => console.log("AgoraRTC Client Connected"), handlefail)
  client.setClientRole(options.role);

  if (options.role === "host") {
    let token = await getToken(channelName, Username + "123");
    client.join(token, channelName, Username + "123", (uid) => {
      let localStream = AgoraRTC.createStream({
        streamID: uid,
        video: true,
        audio: true
      })
      localStream.init(function () {
        localStream.play("HostStream");
        console.log(`App ID: ${appId}\nChannel Name: ${channelName}`)
        client.publish(localStream)
        addParticipant(Username + " (Me)");
      })
      localStreams.camera.id = uid;
      localStreams.camera.stream = localStream;
    })
    let tokenTwo = await getToken(channelName, Username + "123" + "screen");
    screenClient.init(appId, function() {
      console.log("host screen shared");
    }, handlefail)
    screenClient.join(tokenTwo, channelName, Username + "123" + "screen", (uid) => {
      localStreams.screen.id = uid;

      let screenStream = AgoraRTC.createStream({
        streamID: uid,
        screen: true,
        audio: true,
        video: false,
        optimizationMode: "motion"
      });
      screenStream.init(function() {
        localStreams.screen.stream = screenStream;
        screenStream.play("ScreenStream");
        screenClient.publish(screenStream);
      })
    });
    screenClient.on('stream-published', function (evt) {
      mainStreamId = Username + "123" + "screen";
    });
    addLeaveHost();
 } else {
    let token = await getToken(channelName, Username);
    client.join(token, channelName, Username, (uid) => {
      let localStream = AgoraRTC.createStream({
        streamID: uid,
        video: true,
        audio: false
      })
      localStream.init(function () {
        addVideoStream(uid);
        localStream.play(uid);
        console.log(`App ID: ${appId}\nChannel Name: ${channelName}`)
        client.publish(localStream)
        addParticipant(Username + " (Me)");
        addLeave();
      })
      localStreams.camera.id = uid;
      localStreams.camera.stream = localStream;
    })
  }

  client.on('stream-subscribed', function (evt) {
    console.log("Subscribed Stream");
    let stream = evt.stream;
    let streamID = stream.getId();
    remoteStreams[streamID] = stream;
    console.log(streamID + " " + streamID.includes("123") + " " + !streamID.includes("screen"))
    if (streamID.includes("123") && !streamID.includes("screen")) {
      addHostStream(streamID);
      addParticipant(streamID + " (Host)");
    }

    if (streamID.includes("123") && streamID.includes("screen")) {
      addHostScreenStream(streamID);
      mainStreamId = streamID;
    }

    if (streamID !== mainStreamId && !streamID.includes("123")) {
      addVideoStream(streamID);
      addParticipant(streamID);
      stream.play(streamID);
    }
  })

  client.on('stream-added', function (evt) {
    console.log("Added Stream");
    let stream = evt.stream;
    let streamId = stream.getId();
    if (streamId != localStreams.screen.id) {
      client.subscribe(evt.stream, handlefail)
    }
  })

  client.on('peer-leave', function (evt) {
    let streamId = evt.stream.getId();
    if (remoteStreams[streamId] != undefined) {
      remoteStreams[streamId].stop();
      delete remoteStreams[streamId];
      if (streamId === mainStreamId) {
        remoteStream[streamId].close();
        remoteStream[streamId].stop();
        client.leave();
      }
    }
    // deleteParticipant(streamId);
    let remoteContainer = document.getElementById("remoteStreams");
    let streamDiv = document.getElementById(streamId);
    remoteContainer.removeChild(streamDiv);
  })
}
