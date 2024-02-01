import express from "express";
import bodyParser from "body-parser";
import axios from "axios"
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";



const app = express();
const port = 3000;
const API_URL = "http://localhost:4000"
let msg;
let isAuthenticated = false;
let isNewUser = false;


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "KEYTOBEUSEDTOSTORETHESESSION",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
    }
  }));

app.use(passport.initialize());
app.use(passport.session());

app.get("/",(req, res)=>{
    if(req.isAuthenticated()){
        res.redirect("/content")
    }else{
        res.render("register.ejs");
    }
})

app.get("/login",(req, res)=>{
    res.render("login.ejs");
});
app.get("/content", (req, res)=>{
    // console.log(req.user)
    if(req.isAuthenticated()){
        if(req.user.length===0){
            res.render("content.ejs", {content: req.user});
        }else{
            res.render("content.ejs", {content: JSON.parse(req.user)});
        }
        
    } else{
        res.redirect("/login")
    }
});

app.get("/add", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("editForm.ejs")
    } else{
        res.redirect("/login")
    }
});
app.post("/register", async (req, res)=>{
    const {username, password} = req.body;
    
    try {
        const response = await axios.post(`${API_URL}/register`, {email: username, password: password});
        const user = response.data.content;
        req.login(user, (err)=> {
            if(err) console.log(err.message);
            res.redirect("/content");
        });
        isAuthenticated = true;
    } catch (error) {
        res.redirect('/');
        console.error("register: " +error.message);
    }

    
});

app.post("/login", passport.authenticate("local",{
    successRedirect: "/content",
    failureRedirect: "/login",
}));

passport.use(new Strategy(async function verify(username, password, cb){
    try{
        const response = await axios.post(`${API_URL}/login`, {email: username, password: password});
        const user = response.data.content;
        if (response.data.status){
            isAuthenticated = true;
            
            return cb(null, user);
            // res.render("content.ejs", {content: JSON.parse(response.data.content)});
        } else{
            // res.redirect("/login");
            console.log("user not found")
            return cb(null, false);
        }
        
    } catch (error) {
        console.log(error.message);
        // res.redirect("/login");
        return cb(error.message);
    }
}));

passport.serializeUser((user, cb)=>{
    cb(null, user);
});
passport.deserializeUser((user, cb)=>{
    cb(null, user);
});

app.post("/add", async (req, res)=>{
    const {title, content} = req.body;
    const response = await axios.post(`${API_URL}/save`, {title: title, content: content});
    if(response.data.status){
        res.render("content.ejs", {content: JSON.parse(response.data.content)});
    } else{
        console.log(response.status.message);
    }
});


app.get("/delete/:id", async (req, res)=>{
    const id = req.params.id;
    const response = await axios.delete(`${API_URL}/delete/${id}`);
    console.log(response.data.status);
    res.render("content.ejs", {content: JSON.parse(response.data.content)});
});

app.get("/edit/:id", async (req, res)=>{
    const id = req.params.id;
    const response = await axios.get(`${API_URL}/edit/${id}`);
    res.render("editForm.ejs", {content: JSON.parse(response.data.content)});
    console.log(response.data.status);
});
app.post("/edit", async (req, res)=>{
    const { title, content} = req.body
    const response = await axios.patch(`${API_URL}/edit`, {title: title, content: content});
    res.render("content.ejs", {content: JSON.parse(response.data.content)});
    console.log(response.data);
});





app.listen(port, ()=>{
 console.log(`started on port ${port}`);
});