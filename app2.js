import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ debug: true });
import { dbConnection } from "./middlewares/dbconnection.js";
import mongoose from "mongoose";

const PORTNUMBER = process.env.PORT;
const app = express();

// Serve static files from "public" folder
app.use(express.static(path.join(import.meta.dirname,"public")));
//This line is required to parse JSON body
//app.use(express.json());
//express.urlencoded use for get form data when submit nested level in single dimention array format.
// express:ture will enable to get data in nested (multi-dimention) array format.
//app.use(express.urlencoded({express:true}));
var User;
app.use(/^\/user.*/i,dbConnection,(req, res) => {
    console.log("Calling dbConnection middleware for /user*/* route");
    // connectToDatabase()
    // .then(() => console.log('Connected!'))
    // .catch(err => {
    //     console.error("Failed to connect to the database:", err);
    //     res.status(401).send("Unauthorized Access - Database connection error");
    // });
    // next(); // Call next middleware
    app.listen(PORTNUMBER,() => {
        console.log(`Server is running at port ${PORTNUMBER}`);
    });
}); 
// Use the database connection middleware

// app.use(/^\/user.*/i, (req, res, next) => {
//     console.log("Middleware for /next route");
//     dbConnection();
//     next(); // Call next middleware
// });
// app.use(/^\/user.*/i, (req, res, next) => {
//     console.log("Initial call - Middleware for /user*/* route");
//     connectToDatabase()
//     .then(() => console.log('Connected!'))
//     .catch(err => {
//         console.error("Failed to connect to the database:", err);
//         //process.exit(1); // Exit the process if the connection fails
//         res.status(401).send("Database connection error");
//     });
//     next(); // Call next middleware
// });
app.get("/",(req,res) => {
    console.log("Middleware for / route");
    //homePagePath will give you the whole file path
    // import.meta.dirname will give the path till here means till app.js
    // public is folder name join with base path + index.html
    var homePagePath = path.join(import.meta.dirname,"public","index.html");
    res.sendFile(homePagePath);
});

function getCollection(tableName) {
   const userSchema = new mongoose.Schema({
        firstname: String,
        lastname: String,
        city: String
    });
    if(!User) {
        // If User model is not defined, create it
        User = mongoose.model(tableName, userSchema);
        // console.log("User model created for collection:", tableName);
        // Uncomment the line below to log when the model is created
        console.log("Creating User model for collection:", tableName);
    }   
    
    return User.find({}).then((data) => {
        return data;
    }).catch((err) => {
        console.error("Error fetching users:", err);
        throw err;
    });   
}

// app.use("/", (req, res, next) => {
//     console.log("Middleware for /next route");
//     next(); // Call next middleware
// });

app.get("/users",(req,res) => {
    var users = getCollection("users");
  // console.log("Database connected...");
    users.then((data) => {
        console.log("Users fetched successfully:", data);       
         res.json(data);   
    }).catch((err) => {
        res.status(500).send("Error fetching users: " + err);
    });
});

app.get("/userslistwithnext",(req,res, next) => {
    var users = getCollection("users");
  // console.log("Database connected...");
    users.then((data) => {
        console.log("Users fetched successfully:", data);
        next(); // Call next middleware
        // res.json(data);   
    }).catch((err) => {
        res.status(500).send("Error fetching users",err);
    });
}, (req, res, next) => {
     console.log("second response 2");
     res.send("Users fetched successfully.");
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

// app.use("/",(err, req, res, next) => {
//     console.error("An error occurred:", err);
//     res.status(500).send("Internal Server Error");
// });
// app.use((req, res)=> {
//     var pageNotFound = path.join(import.meta.dirname,"views","404.html");
//     res.status(404).sendFile(pageNotFound);
// });
app.use((err,req, res, next) => {
    console.log("Middleware for 404 route");
    // Handle the error here
    if(err) {
        console.error("An error occurred:", err);
        return res.status(500).send("Internal Server Error");
    }    
});