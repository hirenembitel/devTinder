import express from "express";
import { dbConnection } from "./middlewares/dbconnection.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import './helpers/cronjobs.js';
import http, { createServer } from 'http';
import initializeSocket from './helpers/socket.js';


const PORTNUMBER = process.env.PORT;
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(dbConnection); // Use the database connection middleware
app.use(cookieParser());
app.use(cors({
    origin: "http://192.168.1.224:5173", // Allow requests from this origin
    credentials: true, // Allow cookies to be sent with requests
}));

import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import requestRouter from "./routes/request.js";
import chatRouter from "./routes/chat.js";

app.use("/",userRouter);
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",chatRouter);
//app.post("/signup", express.json(), async (req, res) => {

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORTNUMBER,"0.0.0.0",() => {
    console.log(`Server is running at port ${PORTNUMBER}`);
});