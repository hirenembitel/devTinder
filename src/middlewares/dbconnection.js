import mongoose from "mongoose";

const uri = 'mongodb+srv://hirenembitel:s4b4vR2b6ofizeyp@cluster0.s9b1phh.mongodb.net/';
const dbName = "NodeJSPractice";

async function connectToDatabase() {   
    await mongoose.connect(uri, {
        dbName: dbName
    });
}

export const dbConnection = (req, res, next) => {
    connectToDatabase()
    .then(() => console.log('Connected!'))
    .catch(err => {
        console.error("Failed to connect to the database:", err);
        res.status(401).send("Unauthorized Access - Database connection error");
        // throw err; // Optionally rethrow to handle elsewhere
    });
    console.log("Middleware for next call route");
    next(); // Call next middleware
}