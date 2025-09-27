const express = require('express');
const path = require('path');
const {connectMongoDB} = require('./connect');
const URL = require('./models/user'); 
const cookieParser = require('cookie-parser');
const { checkForAuthentication, restrictTo , checkAuth} = require('./middleware/AuthUser');

const AuthuserRoute = require('./routes/Authuser');

const staticRoutes = require('./routes/staticRoutes');
const urlroute = require("./routes/url");
const app = express();
const port = 8001;

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cookieParser());


app.set("view engine", "ejs");
app.set("views",path.resolve("./views"));



// Public routes (no authentication required)
app.use("/authuser", AuthuserRoute);

// Protected routes (authentication required)
app.use("/url", checkForAuthentication, restrictTo(["Normal"]), urlroute);

// Static routes with authentication check
app.use("/", checkAuth, staticRoutes);











// This route should be after /url routes to avoid conflicts
app.get("/:shortId",async(req,res)=>{
    try{
    const shortId = req.params.shortId;
    const entry =await URL.findOneAndUpdate({
        shortId:shortId
    },   {
        $push :{
            visitHistory:{
                timestamp : Date.now()
            }
        }
    } , { new: true }  );

    if (!entry) {
    return res.status(404).json({ error: "Short URL not found" });
  }
    res.redirect(entry.redirectURL);
} catch(err){
    console.error("Error in get /:shortId", err);
    return res.status(500).json({ error: "Internal server error" });
} 
})

// static routes already mounted above
// Start server after successful DB connection
async function startServer() {
    try {
        await connectMongoDB("mongodb://127.0.0.1:27017/shortURL");
        console.log("MongoDB is connected successfully!");
        console.log("Database: shortURL");
        
        app.listen(port, () => {
            console.log(`Server is started at Port : ${port}`);
        });
    } catch (err) {
        console.error("MongoDB connection error:", err);
        console.log("Please make sure MongoDB is running on localhost:27017");
        process.exit(1);
    }
}

startServer();