
import  { useEffect, useRef, useState } from "react";

import io from "socket.io-client";

import { Badge, IconButton, TextField, Button } from "@mui/material";

import VideocamIcon from "@mui/icons-material/Videocam";

import VideocamOffIcon from "@mui/icons-material/VideocamOff";

import CallEndIcon from "@mui/icons-material/CallEnd";

import MicIcon from "@mui/icons-material/Mic";

import MicOffIcon from "@mui/icons-material/MicOff";

import ScreenShareIcon from "@mui/icons-material/ScreenShare";

import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";

import ChatIcon from "@mui/icons-material/Chat";

import "../style/VideoMeet.css";

const serverUrl = "http://localhost:3000/";

const connections = {};

const peerConnectionConfig = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
};



export default function VideoMeetComponent() {

    const socketRef = useRef(null);

    const socketIdRef = useRef(null);

    const localVideoRef = useRef(null);

    const [videoAvailable, setVideoAvailable] = useState(true);

    const [audioAvailable, setAudioAvailable] = useState(true);

    const [video, setVideo] = useState([]);

    const [audio, setAudio] = useState();

    const [screen, setScreen] = useState();

    const [showChat, setShowChat] = useState(true);

    const [screenAvailable, setScreenAvailable] = useState();

    const [messages, setMessages] = useState([]);

    const [message, setMessage] = useState("");

    const [newMessages, setNewMessages] = useState(3);

    const [askForUsername, setAskForUsername] = useState(true);

    const [username, setUsername] = useState("");



    const videoRefs = useRef([]);

    const [videos, setVideos] = useState([]);

    useEffect(() => {


        getPermissions();

    }, []);

    const getDisplayMedia = () => {

        if (screen) {

            if (navigator.mediaDevices.getDisplayMedia) {

                
                navigator.mediaDevices
                    .getDisplayMedia({
                        video: true,
                        audio: true
                    })

                    .then(getDisplayMediaSuccess)

                    .then((stream) => { })

                    .catch((error) => console.log(error));
            }
        }
    };


    const getPermissions = async () => {

        try {

            const videoPermission =
                await navigator.mediaDevices.getUserMedia({
                    video: true
                });

            if (videoPermission) {

                setVideoAvailable(true);

                console.log("Video permission granted");

            } else {

                setVideoAvailable(false);

                console.log("Video permission denied");
            }

            const audioPermission =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });


            if (audioPermission) {

                setAudioAvailable(true);

                console.log("Audio permission granted");

            } else {

           
                setAudioAvailable(false);

                console.log("Audio permission denied");
            }

            if (navigator.mediaDevices.getDisplayMedia) {

                setScreenAvailable(true);

            } else {

                setScreenAvailable(false);
            }



            if (videoAvailable || audioAvailable) {

                const userMediaStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: videoAvailable,
                        audio: audioAvailable
                    });

                if (userMediaStream) {

                    window.localStream = userMediaStream;

                    if (localVideoRef.current) {

                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch (error) {

            console.log(error);
        }
    };


    useEffect(() => {

        if (video !== undefined && audio !== undefined) {

        
            getUserMedia();

            
            console.log(
                "Video state:",
                video,
                "Audio state:",
                audio
            );
        }

    }, [video, audio]);


    const getMedia = () => {

        setVideo(videoAvailable);


        setAudio(audioAvailable);

        connectToSocketServer();
    };

    const getUserMediaSuccess = (stream) => {

        try {

            window.localStream
                .getTracks()
                .forEach(track => track.stop());

        } catch (error) {

            console.log(error);
        }

        window.localStream = stream;


        localVideoRef.current.srcObject = stream;

        for (let id in connections) {

            if (id === socketIdRef.current) {
                continue;
            }

            connections[id].addStream(window.localStream);

            connections[id]
                .createOffer()
                .then((description) => {

                    return connections[id]
                        .setLocalDescription(description);

                })
                .then(() => {

                    socketRef.current.emit(
                        "signal",
                        id,
                        JSON.stringify({
                            sdp: connections[id].localDescription
                        })
                    );

                })
                .catch(error => console.log(error));
        }

        stream.getTracks().forEach(track => {

            track.onended = () => {

                setVideo(false);

                setAudio(false);


                try {

                    const tracks =
                        localVideoRef.current.srcObject.getTracks();

                    tracks.forEach(track => track.stop());

                } catch (error) {

                    console.log(error);
                }

                const blackSilenceStream = () =>
                    new MediaStream([
                        createBlackVideo(),
                        createSilenceAudio()
                    ]);

                window.localStream = blackSilenceStream();

                localVideoRef.current.srcObject = window.localStream;

                for (let id in connections) {

                    connections[id]
                        .addStream(window.localStream);


                   
                    connections[id]
                        .createOffer()
                        .then(description => {

                           
                            return connections[id]
                                .setLocalDescription(description);

                        })
                        .then(() => {

                            
                            socketRef.current.emit(
                                "signal",
                                id,
                                JSON.stringify({
                                    sdp:
                                        connections[id]
                                            .localDescription
                                })
                            );

                        })
                        .catch(error => console.log(error));
                }
            };
        });
    };


  

    const getUserMedia = () => {

        if (
            (video && videoAvailable) ||
            (audio && audioAvailable)
        ) {

    
            navigator.mediaDevices
                .getUserMedia({
                    video: video,
                    audio: audio
                })

             
                .then(getUserMediaSuccess)

      
                .catch(error => console.log(error));

        } else {

            try {

               
                const tracks =
                    localVideoRef.current.srcObject.getTracks();


           
                tracks.forEach(track => track.stop());

            } catch (error) {

                // Stream nahi mili to kuch nahi karo
            }
        }
    };



    const getDisplayMediaSuccess = (stream) => {

        
        console.log("Screen sharing started");


        try {

      
            window.localStream
                .getTracks()
                .forEach(track => track.stop());

        } catch (error) {

            console.log(error);
        }


        window.localStream = stream;


        localVideoRef.current.srcObject = stream;



        for (let id in connections) {

     
            if (id === socketIdRef.current) {
                continue;
            }


  
            connections[id]
                .addStream(window.localStream);


       
            connections[id]
                .createOffer()
                .then(description => {

              
                    return connections[id]
                        .setLocalDescription(description);

                })
                .then(() => {

               
                    socketRef.current.emit(
                        "signal",
                        id,
                        JSON.stringify({
                            sdp:
                                connections[id]
                                    .localDescription
                        })
                    );

                })
                .catch(error => console.log(error));
        }



        stream.getTracks().forEach(track => {

            
            track.onended = () => {

                
                setScreen(false);


                try {

                   
                    const tracks =
                        localVideoRef.current.srcObject.getTracks();


                  
                    tracks.forEach(track => track.stop());

                } catch (error) {

                    console.log(error);
                }


              
                const blackSilenceStream = () =>
                    new MediaStream([
                        createBlackVideo(),
                        createSilenceAudio()
                    ]);


                
                window.localStream = blackSilenceStream();


                localVideoRef.current.srcObject =
                    window.localStream;


                
                getUserMedia();
            };
        });
    };



    const gotMessageFromServer = (fromId, message) => {

        const signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {

            if (signal.sdp) {

                connections[fromId]
                    .setRemoteDescription(
                        new RTCSessionDescription(signal.sdp)
                    )
                    .then(() => {

                        if (signal.sdp.type === "offer") {

                            return connections[fromId]
                                .createAnswer();
                        }

                    })
                    .then(answer => {

                        if (answer) {

                            return connections[fromId]
                                .setLocalDescription(answer);
                        }

                    })
                    .then(() => {

                        if (
                            connections[fromId].localDescription
                        ) {

                            socketRef.current.emit(
                                "signal",
                                fromId,
                                JSON.stringify({
                                    sdp:
                                        connections[fromId]
                                            .localDescription
                                })
                            );
                        }

                    })
                    .catch(error => console.log(error));
            }


            if (signal.ice) {

                connections[fromId]
                    .addIceCandidate(
                        new RTCIceCandidate(signal.ice)
                    )
                    .catch(error => console.log(error));
            }
        }
    };


    const connectToSocketServer = () => {

        socketRef.current = io.connect(serverUrl, {
            secure: false
        });



        socketRef.current.on(
            "signal",
            gotMessageFromServer
        );


        socketRef.current.on("connect", () => {


            socketRef.current.emit(
                "join-call",
                window.location.href
            );



            socketIdRef.current = socketRef.current.id;

            socketRef.current.on(
                "chat-message",
                addMessage
            );

            socketRef.current.on(
                "user-left",
                (leftUserId) => {

                    setVideos(previousVideos =>
                        previousVideos.filter(
                            video =>
                                video.socketId !== leftUserId
                        )
                    );
                }
            );


            socketRef.current.on(
                "user-joined",
                (newUserId, clients) => {

                    clients.forEach(userSocketId => {

                        connections[userSocketId] =
                            new RTCPeerConnection(
                                peerConnectionConfig
                            );
                        connections[userSocketId]
                            .onicecandidate =
                            (event) => {

                                if (event.candidate != null) {

                                    
                                    socketRef.current.emit(
                                        "signal",
                                        userSocketId,
                                        JSON.stringify({
                                            ice:
                                                event.candidate
                                        })
                                    );
                                }
                            };


                        connections[userSocketId]
                            .onaddstream =
                            (event) => {

                       
                                console.log(
                                    "Current videos:",
                                    videoRefs.current
                                );
                                const videoAlreadyExists =
                                    videoRefs.current.find(
                                        video =>
                                            video.socketId ===
                                            userSocketId
                                    );


                                if (videoAlreadyExists) {

                                    setVideos(
                                        previousVideos => {

                                        
                                            const updatedVideos =
                                                previousVideos.map(
                                                    video =>

                                                        
                                                        video.socketId ===
                                                        userSocketId

                                                        
                                                            ? {
                                                                ...video,
                                                                stream:
                                                                    event.stream
                                                            }

                                                          
                                                            : video
                                                );


                                            videoRefs.current = updatedVideos;
                                            return updatedVideos;
                                        }
                                    );

                                } else {

                                    const newVideo = {

                                        socketId:
                                            userSocketId,

                                        stream:
                                            event.stream,

                                        autoplay: true,

                                        playsinline: true
                                    };

                                    setVideos(
                                        previousVideos => {

                                            const updatedVideos = [
                                                ...previousVideos,
                                                newVideo
                                            ];

                                            videoRefs.current =
                                                updatedVideos;


                                         
                                            return updatedVideos;
                                        }
                                    );
                                }
                            };


                        if (
                            window.localStream !== undefined &&
                            window.localStream !== null
                        ) {

                            connections[userSocketId]
                                .addStream(
                                    window.localStream
                                );

                        } else {

                            const blackSilenceStream =
                                new MediaStream([
                                    createBlackVideo(),
                                    createSilenceAudio()
                                ]);


                            window.localStream =
                                blackSilenceStream;

                            connections[userSocketId]
                                .addStream(
                                    window.localStream
                                );
                        }
                    });

                    if (newUserId === socketIdRef.current) {

                        for (
                            let userId in connections
                        ) {


                            if (
                                userId ===
                                socketIdRef.current
                            ) {
                                continue;
                            }


                            try {


                                connections[userId]
                                    .addStream(
                                        window.localStream
                                    );

                            } catch (error) {

                                
                            }



                            connections[userId]
                                .createOffer()
                                .then(description => {

     
                                    return connections[userId]
                                        .setLocalDescription(
                                            description
                                        );

                                })
                                .then(() => {


                                    socketRef.current.emit(
                                        "signal",
                                        userId,
                                        JSON.stringify({
                                            sdp:
                                                connections[
                                                    userId
                                                ]
                                                    .localDescription
                                        })
                                    );

                                })
                                .catch(error =>
                                    console.log(error)
                                );
                        }
                    }
                }
            );
        });
    };


   
    const createSilenceAudio = () => {

        const audioContext =
            new AudioContext();

        const oscillator = audioContext.createOscillator();

        const destination =
            oscillator.connect(
                audioContext.createMediaStreamDestination()
            );



        oscillator.start();

        audioContext.resume();

        return Object.assign(
            destination.stream.getAudioTracks()[0],
            {
                enabled: false
            }
        );
    };

    const createBlackVideo = ({
        width = 640,
        height = 480
    } = {}) => {

        const canvas =
            document.createElement("canvas");



        canvas.width = width;


        canvas.height = height;



        const context =
            canvas.getContext("2d");



        context.fillRect(
            0,
            0,
            width,
            height
        );

        const stream =
            canvas.captureStream();

        return Object.assign(
            stream.getVideoTracks()[0],
            {
                enabled: false
            }
        );
    };


    const handleVideo = () => {

        setVideo(previousVideo =>
            !previousVideo
        );
    };



    const handleAudio = () => { 

        setAudio(previousAudio =>
            !previousAudio
        );
    };



    useEffect(() => {

        if (screen !== undefined) {

            getDisplayMedia();
        }

    }, [screen]);

    const handleScreen = () => {

        setScreen(previousScreen =>
            !previousScreen
        );
    };


    const handleEndCall = () => {

        try {

            const tracks =
                localVideoRef.current
                    .srcObject
                    .getTracks();

            tracks.forEach(track =>
                track.stop()
            );

        } catch (error) {

        }

        window.location.href = "/";
    };


    const openChat = () => {

        setShowChat(true);

        setNewMessages(0);
    };


    const closeChat = () => {


        setShowChat(false);
    };


 

    const handleMessage = (event) => {

        setMessage(
            event.target.value
        );
    };


    const addMessage = (
        data,
        sender,
        socketIdSender
    ) => {

        setMessages(previousMessages => [

            ...previousMessages,
            {
                sender: sender,
                data: data
            }
        ]);

        if (
            socketIdSender !==
            socketIdRef.current
        ) {

            setNewMessages(
                previousCount =>
                    previousCount + 1
            );
        }
    };


    const sendMessage = () => {

       
        console.log(socketRef.current);

        socketRef.current.emit(
            "chat-message",
            message,
            username
        );

        setMessage("");
    };


    const connect = () => {

        setAskForUsername(false);



        getMedia();
    };


    return (

        <div>

            {askForUsername === true ? (

   

                <div>


                    <h2>Enter into Lobby</h2>


                    <TextField
                        id="username"
                        label="Username"
                        value={username}

                        onChange={event =>
                            setUsername(
                                event.target.value
                            )
                        }

                        variant="outlined"
                    />



                    <Button
                        variant="contained"
                        onClick={connect}
                    >
                        Connect
                    </Button>


                    <div>

                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                        />

                    </div>

                </div>

            ) : (


                <div className="meetVideoContainer">


                    {showChat ? (

                        <div className="chatRoom">

                            <div className="chatContainer">

               
                                <h1>Chat</h1>


                    
                                <div className="chattingDisplay">

                                    {messages.length !== 0 ? (

                                       
                                        messages.map(
                                            (item, index) => (

                                                <div
                                                    style={{
                                                        marginBottom:
                                                            "20px"
                                                    }}
                                                    key={index}
                                                >

                                                    
                                                    <p
                                                        style={{
                                                            fontWeight:
                                                                "bold"
                                                        }}
                                                    >
                                                        {item.sender}
                                                    </p>


                                                  
                                                    <p>
                                                        {item.data}
                                                    </p>

                                                </div>
                                            )
                                        )

                                    ) : (

                                        
                                        <p>
                                            No Messages Yet
                                        </p>
                                    )}

                                </div>


                                

                                <div className="chattingArea">

                                 
                                    <TextField
                                        value={message}
                                        onChange={event =>
                                            setMessage(
                                                event.target.value
                                            )
                                        }
                                        id="chat-message"
                                        label="Enter Your chat"
                                        variant="outlined"
                                    />


                                    <Button
                                        variant="contained"
                                        onClick={sendMessage}
                                    >
                                        Send
                                    </Button>

                                </div>

                            </div>

                        </div>

                    ) : (

                        
                        <></>
                    )}



                    <div className="buttonContainers">


                       

                        <IconButton
                            onClick={handleVideo}
                            style={{
                                color: "white"
                            }}
                        >

                            
                            {video === true ? (

                                <VideocamIcon />

                            ) : (

                               
                                <VideocamOffIcon />
                            )}

                        </IconButton>



                        <IconButton
                            onClick={handleEndCall}
                            style={{
                                color: "red"
                            }}
                        >

                            <CallEndIcon />

                        </IconButton>


                        <IconButton
                            onClick={handleAudio}
                            style={{
                                color: "white"
                            }}
                        >

                            
                            {audio === true ? (

                                <MicIcon />

                            ) : (

                                // Audio OFF
                                <MicOffIcon />
                            )}

                        </IconButton>


                    
                        {screenAvailable === true ? (

                            <IconButton
                                onClick={handleScreen}
                                style={{
                                    color: "white"
                                }}
                            >

                                {screen === true ? (

                                    <ScreenShareIcon />

                                ) : (

                                    
                                    <StopScreenShareIcon />
                                )}

                            </IconButton>

                        ) : (

                           
                            <></>
                        )}


                        

                        <Badge
                            badgeContent={newMessages}
                            max={999}
                            color="orange"
                        >

                            <IconButton
                                onClick={() =>
                                    setShowChat(
                                        previousValue =>
                                            !previousValue
                                    )
                                }
                                style={{
                                    color: "white"
                                }}
                            >

                                <ChatIcon />

                            </IconButton>

                        </Badge>

                    </div>


                  
                    <video
                        className="meetUserVideo"
                        ref={localVideoRef}
                        autoPlay
                        muted
                    />



                    <div className="conferenceView">

                     
                        {videos.map(video => (

                            <div
                                key={video.socketId}
                            >

                                <video

                                   
                                    data-socket={
                                        video.socketId
                                    }


                                  
                                    ref={videoElement => {

                                        
                                        if (
                                            videoElement &&
                                            video.stream
                                        ) {

                                           
                                            videoElement.srcObject =
                                                video.stream;
                                        }
                                    }}


                                    
                                    autoPlay

                                />

                            </div>

                        ))}

                    </div>

                </div>
            )}

        </div>
    );
}

