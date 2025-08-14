import { Server } from 'socket.io';

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin:"http://localhost:5173"
        }
    });

    io.on("connection", (socket) => {
        socket.on("joinChat",({firstName, userId,targetUserId}) => {
            const roomId = [userId,targetUserId].sort().join("_");
            //console.log(firstName+" joined the room "+roomId);
            socket.join(roomId);
        });
        socket.on("sendMessage",({firstName,userId,targetUserId,newMessageText}) => {
            const roomId = [userId,targetUserId].sort().join("_");
           // console.log(firstName+'---'+newMessageText);
            io.to(roomId).emit("messageReceived",{firstName,newMessageText});
        });
        socket.on("disconnect",() =>{

        });
    console.log("A user connected");
    });
}

export default initializeSocket;