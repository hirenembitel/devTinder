import mongoose from "mongoose";

const uri = process.env.DB_URL;
const dbName = process.env.DB_NAME;


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