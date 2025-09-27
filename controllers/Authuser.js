const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcryptjs');
const Authuser = require('../models/Authuser');
const { setUser} = require('../services/AuthUser');

async function handleAuthUserSignup(req, res) {
   const { username, email, password } = req.body;
   console.log("Signup attempt:", { username, email, password: "***" });
   
   try {
      // Check if user already exists
      const existingUser = await Authuser.findOne({ email });
      if (existingUser) {
         console.log("User already exists:", existingUser.email);
         return res.render("signup", { error: "Email already registered" });
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await Authuser.create({
          username,
          email,
          password : hashedPassword,
      });
      console.log("User created successfully:", newUser.email);
      return res.redirect("/login");
   } catch (err) {
      console.error("Signup error:", err);
      if (err && err.code === 11000) {
         const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : "field";
         const message = field === "email" ? "Email already registered" : `Duplicate value for ${field}`;
         return res.render("signup", { error: message });
      }
      return res.render("signup", { error: "Unable to sign up. Please try again." });
   }
};



async function handleAuthUserLogin(req, res) {
   const { email, password } = req.body;
   console.log("Login attempt:", { email, password});
   
   try {
      const user = await Authuser.findOne({ email });
      
      if(!user){
         console.log("User not found:", email);
         return res.render("login", {
             error: "Invalid email or password"
         });
      }
      
      // Compare password with hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if(!isPasswordValid){
         console.log("Invalid password for user:", email);
         return res.render("login", {
             error: "Invalid email or password"
         });
      }
      
      console.log("Login successful for user:", email);
      const token = setUser(user);
      res.cookie("token", token);
      return res.redirect("/");
   } catch (err) {
      console.error("Login error:", err);
      return res.render("login", {
          error: "Login failed. Please try again."
      });
   }
};

module.exports = { handleAuthUserSignup, handleAuthUserLogin };