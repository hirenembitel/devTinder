import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ debug: true });

const PORTNUMBER = process.env.PORT;
const app = express();

// Serve static files from "public" folder
app.use(express.static(path.join(import.meta.dirname,"public")));
//express.urlencoded use for get form data when submit nested level in single dimention array format.
// express:ture will enable to get data in nested (multi-dimention) array format.
app.use(express.urlencoded({express:true}));

app.get("/",(req,res) => {
    //homePagePath will give you the whole file path
    // import.meta.dirname will give the path till here means till app.js
    // public is folder name join with base path + index.html
    var homePagePath = path.join(import.meta.dirname,"public","index.html");
    res.sendFile(homePagePath);
});


app.use((req, res)=> {
    var pageNotFound = path.join(import.meta.dirname,"views","404.html");
    res.status(404).sendFile(pageNotFound);
});

app.listen(PORTNUMBER,() => {
    console.log(`Server is running at port ${PORTNUMBER}`);
});