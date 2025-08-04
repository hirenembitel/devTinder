import express from "express";
import { dbConnection } from "./middlewares/dbconnection.js";
import cookieParser from "cookie-parser";

const PORTNUMBER = process.env.PORT;
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(dbConnection); // Use the database connection middleware
app.use(cookieParser());

import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import requestRouter from "./routes/request.js";

app.use("/",userRouter);
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
//app.post("/signup", express.json(), async (req, res) => {
 






app.listen(PORTNUMBER,() => {
    console.log(`Server is running at port ${PORTNUMBER}`);
});