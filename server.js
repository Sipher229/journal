import express from "express";
import bodyParser from "body-parser";
import axios from "axios"


const app = express();
const port = 3000;
const API_URL = "http://localhost:4000"
let msg;
let isAuthenticated = false;
let isNewUser = false;
const saltRounds = 10;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/",(req, res)=>{
    res.render("register.ejs");
})

app.get("/login",(req, res)=>{
    res.render("login.ejs");
});

app.get("/add", (req, res)=>{
    if(!isAuthenticated){
        res.redirect("/login")
    } else{
        res.render("editForm.ejs")
    }
});
app.post("/register", async (req, res)=>{
    const {email, password} = req.body;
    
    try {
        const response = await axios.post(`${API_URL}/register`, {email: email, password: password});
        if (response.data.content.length !== 0){
            res.render("content.ejs", {content: JSON.parse(response.data.content)});
        } else{
            res.render("content.ejs");
        }
        isAuthenticated = true;
    } catch (error) {
        res.redirect('/');
        console.error(error.message);
    }

    
});

app.post("/login", async (req, res)=>{
    const {email, password} = req.body;
    try{
        const response = await axios.post(`${API_URL}/login`, {email: email, password: password});
        if (response.data.status && response.data.content.length >0){
            isAuthenticated = true;
            res.render("content.ejs", {content: JSON.parse(response.data.content)});
        } else if (response.data.status){
            isAuthenticated = true;
            res.render("content.ejs");
        } else{
            res.redirect("/login");
        }
        console.log(response.data.message)
    } catch (error) {
        res.redirect("/login");
        console.error(error.message)
    }

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