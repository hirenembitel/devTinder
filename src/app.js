import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ debug: true });
import { mongoose } from "mongoose";
import e from "express";
const uri = 'mongodb+srv://hirenembitel:s4b4vR2b6ofizeyp@cluster0.s9b1phh.mongodb.net/';
//const client = new MongooseClient(uri);
const dbName = "NodeJSPractice";

const PORTNUMBER = process.env.PORT;
const app = express();

// Serve static files from "public" folder
app.use(express.static(path.join(import.meta.dirname,"public")));
//This line is required to parse JSON body
//app.use(express.json());
//express.urlencoded use for get form data when submit nested level in single dimention array format.
// express:ture will enable to get data in nested (multi-dimention) array format.
//app.use(express.urlencoded({express:true}));


app.get("/",(req,res) => {
    //homePagePath will give you the whole file path
    // import.meta.dirname will give the path till here means till app.js
    // public is folder name join with base path + index.html
    var homePagePath = path.join(import.meta.dirname,"public","index.html");
    res.sendFile(homePagePath);
});

async function connectToDatabase() {
    try {
        await mongoose.connect(uri, {
            dbName: dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error:", error);
        throw error;
    }
}
connectToDatabase().catch(err => {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit the process if the connection fails
});


function getCollection(tableName) {
   const userSchema = new mongoose.Schema({
        firstname: String,
        lastname: String,
        city: String
    });
    const User = mongoose.model(tableName, userSchema);
    return User.find({}).then((data) => {
        return data;
    }).catch((err) => {
        console.error("Error fetching users:", err);
        throw err;
    });   
}

app.get("/users",(req,res) => {
    var users = getCollection("users");
   console.log("Database connected...");
    users.then((data) => {
        console.log("Users fetched successfully:", data);
        res.json(data);
    }).catch((err) => {
        res.status(500).send("Error fetching users",err);
    });
});

app.get("/user/:username", (req, res) => {
    const username = req.params.username;
    console.log(`Fetching profile for user: ${username}`);
    // Here you can fetch user data from the database or any other source
    res.send(`Profile page for user: ${username}`);
});

app.post("/user/save", (req, res) => {
    // Here you can handle the form submission data
    console.log(req.query);
    //console.log(req.body);
    res.send("Form submitted successfully!");
});


app.use((req, res)=> {
    var pageNotFound = path.join(import.meta.dirname,"views","404.html");
    res.status(404).sendFile(pageNotFound);
});

app.listen(PORTNUMBER,() => {
    console.log(`Server is running at port ${PORTNUMBER}`);
});