import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors'; // Import the CORS middleware

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
const PORT = process.env.PORT || 8082;

const userIdToSocketIdMap = {
    '6602074ced0956cbb1968355': 'socketId1', // Replace 'socketId1' with the actual socket ID of the user  mohamed
    '65f36fd4d2e6306841233224':'socketId2', //fatma
    // Add more mappings as needed 
};
const getSocketIdByUserId = (userId) => {
    // Lookup the socket ID in the mapping based on the user ID
    return userIdToSocketIdMap[userId];
};

io.on('connection', (socket) => {
    console.log('A user connected');
   
     // Listen for user login event
  socket.on('login', (userId) => {
   

    console.log('does this work');
    //  Map the socket ID to the user ID

  });
    // Capture the user ID when a user connects (you need to pass the user ID from the client)
    const userId ='6602074ced0956cbb1968355';
    const userI = '65f36fd4d2e6306841233224';
    
    // Store the mapping between the user ID and the socket ID
    userIdToSocketIdMap[userId] = socket.id;
    userIdToSocketIdMap[userI] = socket.id;
    //     socket.broadcast.emit('answer', mockAnswer);

    

   
    
    socket.on('offer', (data) => {
        // Forward the offer to the destination peer
        console.log('Received offer from client:', data);
              
        const userId1 ='6602074ced0956cbb1968355';
        const userId2 = '65f36fd4d2e6306841233224';

        const { userId, offer } = data; // Extract userId and offer from data
        console.log("the socketid of the user ", userId , "is : ", socket.id);
        const originateUserIdsocketid = socket.id;
        console.log("originateUserIdsocketid value is :",originateUserIdsocketid);
        // Retrieve the destination socket ID based on userId (implement this logic)
        const destinationSocketId = getSocketIdByUserId(userId1);
        const destinationSocketId1 = getSocketIdByUserId(userId2);
        console.log("the ocketid1",destinationSocketId );  
        console.log("the ocketid1",destinationSocketId1 );  
        io.to(destinationSocketId).emit('offer',{ off:offer,originateUserIdsocketid: originateUserIdsocketid});   
     
        console.log("Offer forwarded to destination peer"); 
      });

   
      socket.on('answer', (data) => {
        // Extract answer and originateUserIdsocketid from data
        const { answer, originateUserIdsocketid } = data;
    console.log("jetna el answer",answer);
        // Send the SDP answer directly to the initiating peer
        io.to(originateUserIdsocketid).emit('answer', answer);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Signaling server is running on port ${PORT}`);
});
