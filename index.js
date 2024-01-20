import express from "express";
import "dotenv/config";
import pg from "pg"
import bodyParser from "body-parser";
import cors from "cors"




const app = express();
const port = 4000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});
db.connect();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));


let userId=0;
let editId;
const time = new Date();

const date = `${time.getMonth()+1}/${time.getDate()}/${time.getFullYear()}`

async function getUserId(email){
    const response = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (response.rows.length===0){
        return false
    } else {
        return response.rows[0].id;
    }
    
 }

async function authenticated(email, password){
    const qry = 'SELECT (email, password) FROM users WHERE email = $1 AND password = $2';
    const response = await db.query(qry, [email, password]);
    if(response.rows.length === 0){
        return false
    } else {
        return true
    }
}
async function getUserContent(id){
    const qry = "SELECT blogs.blog, blogs.title, blogs.user_id, users.email, blogs.date, blogs.id FROM blogs JOIN users ON blogs.user_id = users.id WHERE blogs.user_id = $1"
    const response = await db.query(qry,[id] );
    return response.rows
}

app.get("/", (req, res)=>{
    res.send("Hello!");
});

app.post("/register", async  (req, res)=>{
    console.log("register route hit!");
    const {email, password} = req.body;
    const qry = 'INSERT INTO users(email, password) VALUES ($1, $2)';
    
    try {
        
        const response = await db.query(qry, [email, password]);
        userId = await getUserId(email);
        const notes = await getUserContent(userId);
        console.log(notes);
        if (notes.length === 0){
            res.json({
                status: true,
                content: []
            });
        } else {
            res.json({
                status: true,
                content: JSON.stringify(notes),
            });
        }

    } catch (error) {
        res.json({status: false});
        console.error(error.message)
    }
});
app.post("/login", async  (req, res)=>{
    console.log("login route hit");
    const {email, password} = req.body;
    const qry = "SELECT blogs.blog, blogs.title, blogs.user_id, users.email, blogs.date, blogs.id FROM blogs JOIN users ON blogs.user_id = users.id WHERE blogs.user_id = $1"
    try {
        if (await authenticated(email, password)){
            userId = await getUserId(email);
            // console.log(userId);
            const notes = await getUserContent(userId);
            res.json({
                message: "success",
                status: true,
                content: JSON.stringify(notes),
            });
        } else{
            res.json({
                status: false,
                message: "wrong email or password!",
                content: []
            });
            userId = await getUserId(password);
        }
        
    } catch (error) {
        // console.log(`${email}, ${password}`);
        console.error(error.message);

    }
});


app.post("/save",  async (req, res)=>{
    console.log("save route hit");
    const {title, content} = req.body;
    const qry = "INSERT INTO blogs(blog, title, date, user_id) VALUES ($1, $2, $3, $4)"
    try {
        const response = await db.query(qry, [content, title, date, userId]);
        const data = await getUserContent(userId);
        res.json({
            status: true,
            message: "data saved successfully",
            content: JSON.stringify(data),
         });
    } catch (error) {
        console.error(error.message);
        res.json({
            status: false,
            message: "failed to save data"
        });
    }
});

app.post("/content",  async(req, res)=>{
    console.log("content route hit!");
    const qry = "SELECT blogs.blog, blogs.title, blogs.user_id, users.email, blogs.date, blogs.id FROM blogs JOIN users ON blogs.user_id = users.id WHERE blogs.user_id = $1"
    try {
        const response = await db.query(qry, [userId]);

        if (response.rows.length ===0){
            res.json({status: false})
        } else{
            res.json({
                content: JSON.stringify(response.rows),
                status: true
            });
        }
    } catch (error) {
        console.error(error.message);
        res.json({
            status: false,
            message: error.message
        });
    }
});

app.get("/edit/:id", async (req, res)=>{
   const id = req.params.id;
   editId = id;
    const qry = "SELECT * FROM blogs  WHERE id = $1"
    
    try{
        const response = await db.query(qry,[id]);
        console.log(response.rows)
        if (response.rows.length !== 0){
            res.json({
                status: true,
                content: JSON.stringify(response.rows),
                message: "data loaded successfully"
            });
        } else{
            res.json({
                status: false,
                message: "failed to load data",
            } )
        }
    }catch(e){
        console.error(e.message);
        res.json({
            status: false,
            message: "failed to load data",
        } )
    }

});
app.delete("/delete/:id", async (req, res)=>{
   const id = req.params.id;
    const qry = "DELETE FROM blogs  WHERE id = $1"
    
    try{

        const response = await db.query(qry,[id]);
        const data = await getUserContent(userId);
            res.json({
                status: true,
                message: "data deleted successfully",
                content: JSON.stringify(data)
            });

    }catch(e){
        console.error(e.message);
        res.json({
            status: false,
            message: "failed to delete data",
        } )
    }

});

app.patch("/edit", async (req,res)=>{
    console.log("edit route hit");
    const {content, title} = req.body;
    const qry = "UPDATE blogs SET  blog=$1, title = $2, date= $3 WHERE id = $4"
    try {
        const response = db.query(qry,[content, title, date, editId]);
        const notes = await getUserContent(userId);
        console.log(notes);
        res.json({
            status: true,
            message: "success",
            content: JSON.stringify(notes),
        });
    } catch (error) {
        res.json({
            status: false,
            message: "failed to update",
        });
        console.error(error.message);
    }
    
});


app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
});



