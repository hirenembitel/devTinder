import { Server } from 'socket.io';
import chat from '../models/chat.js';

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin:"http://192.168.1.224:5173"
        }
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({firstName, userId,targetUserId}) => {
            const roomId = [userId,targetUserId].sort().join("_");
            //console.log(firstName+" joined the room "+roomId);
            socket.join(roomId);
        });
        socket.on("sendMessage",async ({firstName,userId,targetUserId,newMessageText}) => {
            const roomId = [userId,targetUserId].sort().join("_");
           // console.log(firstName+'---'+newMessageText);
           
            //save message to the database
            try {
                let chatObject = await chat.findOne({
                    participants:{$all:[userId,targetUserId]}
                });
                if (!chatObject) {
                    chatObject = new chat({
                        participants:[
                            userId,targetUserId
                        ],
                        messages:[]
                    });
                }
                chatObject.messages.push({
                    senderId:userId,
                    text:newMessageText
                });
                await chatObject.save();
                io.to(roomId).emit("messageReceived",{firstName,newMessageText});
            }catch(error) {
               console.log(error);     
            }
        });
        socket.on("disconnect",() =>{

        });
    console.log("A user connected");
    });
}

export default initializeSocket;