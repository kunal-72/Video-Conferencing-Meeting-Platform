const { Server } = require("socket.io");

let connections = {};

let messages = {};

let timeOnline = {};



const connectToSocket = (server) => {
    let io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        }
    });

    io.on("connection", (socket) => {
        
        console.log("something is connnected")


        socket.on("join-call", (path) => {

            if (connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            for (let i = 0; i < connections[path].length; i++) {

                let userSocketId = connections[path][i];

                io.to(userSocketId).emit("user-joined",
                    socket.id,
                    
                    connections[path]
                );
            }

            if (messages[path] !== undefined) {

                
                for (
                    let i = 0;
                    i < messages[path].length;
                    i++
                ) {

                    
                    let oldMessage = messages[path][i];

                    io.to(socket.id).emit(
                        "chat-message",

                        oldMessage.data,

                        oldMessage.sender,

                        oldMessage["socket-id-sender"]
                    );
                }
            }
        });

        socket.on("signal", (toId, message) => {

        

            io.to(toId).emit(
                "signal",
                socket.id,
                message
            );
        });

        socket.on("chat-message", (data, sender) => {

            

            let matchingRoom = null;

            for (const roomName in connections) {

                let usersInRoom = connections[roomName];

                if (usersInRoom.includes(socket.id)) {

                    matchingRoom = roomName;

                    break;
                }
            }

            if (matchingRoom !== null) {


                if (messages[matchingRoom] === undefined) {

                    

                    messages[matchingRoom] = [];
                }


                messages[matchingRoom].push({

                    sender: sender,

                    data: data,

                    
                    "socket-id-sender": socket.id
                });

                console.log(
                    "message",
                    matchingRoom,
                    ":",
                    sender,
                    data
                );

                connections[matchingRoom].forEach(
                    (userSocketId) => {

                        

                        io.to(userSocketId).emit(
                            "chat-message",

                           
                            data,

                            
                            sender,

                         
                            socket.id
                        );
                    }
                );
            }
        });


        socket.on("disconnect", () => {


            let diffTime = Math.abs(
                timeOnline[socket.id] - new Date()
            );


            let matchingRoom = null;


            for (const roomName in connections) {

                let usersInRoom = connections[roomName];

                if (usersInRoom.includes(socket.id)) {

                   
                    matchingRoom = roomName;

                    break;
                }
            }

            if (matchingRoom !== null) {


                connections[matchingRoom].forEach(
                    (userSocketId) => {

                        io.to(userSocketId).emit(
                            "user-left",
                            socket.id
                        );
                    }
                );

                let index = connections[matchingRoom].indexOf(socket.id);

                connections[matchingRoom].splice(
                    index,
                    1
                );

                if (
                    connections[matchingRoom].length === 0
                ) {

                    delete connections[matchingRoom];
                }
            }


        });
    });

    return io;
};

module.exports = connectToSocket;