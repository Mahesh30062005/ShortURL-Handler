const express = require('express');
const URL = require('../models/user');
const routers = express.Router();
const { restrictTo, checkAuth } = require('../middleware/AuthUser');

routers.get("/", async (req,res)=>{
    // If user is not authenticated, redirect to login
    if (!req.AuthUser) {
        return res.redirect("/login");
    }

    try {
        const Allurl = await URL.find({createdBy: req.AuthUser._id });
        return res.render("home", { 
            url: Allurl,
            user: req.AuthUser 
        });
    } catch(err) {
        console.error("Error fetching URLs:", err);
        return res.render("home", { 
            error: "Error loading URLs",
            user: req.AuthUser 
        });
    }
});

routers.get("/signup", (req, res) => {
   return res.render("signup");
});
routers.get("/login", (req, res) => {
   return res.render("login");
});

// Test route to check authentication
routers.get("/test-auth", (req, res) => {
    res.json({
        isAuthenticated: !!req.AuthUser,
        user: req.AuthUser,
        message: req.AuthUser ? "User is authenticated" : "User is not authenticated"
    });
});

// Logout route to clear JWT tokens
routers.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

// Development routes (remove in production)
if (process.env.NODE_ENV !== 'production') {
    // Check database state
    routers.get("/check-db", async (req, res) => {
        try {
            const Authuser = require('../models/Authuser');
            const URL = require('../models/user');
            
            const userCount = await Authuser.countDocuments();
            const urlCount = await URL.countDocuments();
            const allUsers = await Authuser.find({}, { email: 1, username: 1, _id: 1 });
            
            res.json({ 
                message: "Database state checked",
                userCount: userCount,
                urlCount: urlCount,
                users: allUsers
            });
        } catch (err) {
            console.error("Error checking database:", err);
            res.status(500).json({ error: "Failed to check database" });
        }
    });

    // Clear database route for testing
    routers.get("/clear-db", async (req, res) => {
        try {
            const Authuser = require('../models/Authuser');
            const URL = require('../models/user');
            
            await Authuser.deleteMany({});
            await URL.deleteMany({});
            
            res.json({ 
                message: "Database cleared successfully!",
                clearedCollections: ["Authuser", "URL"]
            });
        } catch (err) {
            console.error("Error clearing database:", err);
            res.status(500).json({ error: "Failed to clear database" });
        }
    });
}



module.exports = routers;