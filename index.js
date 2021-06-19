const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
 const DB ="dominencertask"
const URL="mongodb+srv://shashi:shashi1234@cluster0.cwbjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();


const port = process.env.PORT|| 8000;

app.use(express.json());
app.use(cors())

app.post("/register", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);

        let uniqueEmail = await db.collection("users").findOne({ email: req.body.email });

        if (uniqueEmail) {
            res.status(401).json({
                message: "email already exist"
            })
        } else {
            let salt = await bcrypt.genSalt(10);

            let hash = await bcrypt.hash(req.body.password, salt);

            req.body.password = hash;

            let users = await db.collection("users").insertOne(req.body);

            await connection.close();
            res.json({
                message: "User Registerd"
            })
        }
    } catch (error) {
        console.log(error)
    }
})


app.post("/login", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);

        let user = await db.collection("users").findOne({ email: req.body.email })

        if (user) {
            let isPassword = await bcrypt.compare(req.body.password, user.password);
            if (isPassword) {

                let token = jwt.sign({ _id: user._id }, process.env.secret)

                res.json({
                    message: "allow",
                    token,
                    id: user._id
                })
            } else {
                res.status(404).json({
                    message: "Email or password is incorrect"
                })
            }
        } else {
            res.status(404).json({
                message: "Email or password is incorrect"
            })
        }
    } catch (error) {
        console.log(error)
    }
})
// regestration for recruiter
app.post("/recregister", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);

        let uniqueEmail = await db.collection("recruiter").findOne({ email: req.body.email });

        if (uniqueEmail) {
            res.status(401).json({
                message: "email already exist"
            })
        } else {
            let salt = await bcrypt.genSalt(10);

            let hash = await bcrypt.hash(req.body.password, salt);

            req.body.password = hash;

            let users = await db.collection("recruiter").insertOne(req.body);

            await connection.close();
            res.json({
                message: "User Registerd"
            })
        }
    } catch (error) {
        console.log(error)
    }
})


app.post("/reclogin", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);

        let user = await db.collection("recruiter").findOne({ email: req.body.email })

        if (user) {
            let isPassword = await bcrypt.compare(req.body.password, user.password);
            if (isPassword) {

                let token = jwt.sign({ _id: user._id }, process.env.secret)

                res.json({
                    message: "allow",
                    token,
                    id: user._id
                })
            } else {
                res.status(404).json({
                    message: "Email or password is incorrect"
                })
            }
        } else {
            res.status(404).json({
                message: "Email or password is incorrect"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

function authenticate(req, res, next) {
    //Check if there is a Token
    if (req.headers.authorization) {
        //Token is present
        //Check if the token is valid or expired
        try {
            let jwtValid = jwt.verify(req.headers.authorization, process.env.secret);
            if (jwtValid) {
                req.userId = jwtValid._id;
                next();
            }
        } catch (error) {
            res.status(401).json({
                message: "Invalid Token"
            })
        }

    }
    else {
        res.status(401).json({
            message: "No Token Present"
        })
    }

}

//getting user by email

app.get("/user/:id", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let user = await db.collection("users").findOne({ email: req.params.id })
        res.json(user)
        await connection.close();
    } catch (error) {
        console.log(error)

    }
})

//getting recruiter by email

app.get("/recruiter/:id", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let user = await db.collection("recruiter").findOne({ email: req.params.id })
        res.json(user)
        await connection.close();
    } catch (error) {
        console.log(error)

    }
})
//posting job details by recruiter

app.post("/company", authenticate, async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        await db.collection("companies").insertOne(req.body);
        await connection.close();
        res.json({
            message: "company created"
        })
    } catch (error) {
        console.log(error)
    }
})


//getting recruiter by id

app.get("/recruiters/:id", authenticate, async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let recruiter = await db.collection("recruiter").findOne({ _id: mongodb.ObjectID(req.params.id) })
        res.json(recruiter)
        await connection.close();
    } catch (error) {
        console.log(error)
    }
})

//getting user by id

app.get("/users/:id", authenticate, async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let users = await db.collection("users").findOne({ _id: mongodb.ObjectID(req.params.id) })
        res.json(users)
        await connection.close();
    } catch (error) {
        console.log(error)
    }
})

//getting job details

app.get("/job", authenticate, async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let companies = await db.collection("companies").find().toArray();
        res.json(companies)
        await connection.close();
    } catch (error) {
        console.log(error)
    }
})

//posting applied job details by user

app.post("/apply", authenticate, async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        await db.collection("appliedjobs").insertOne(req.body);
            await connection.close();
            res.json({
                message: "job applied"
            })
      
    } catch (error) {
        console.log(error)
    }
})

//getting applied job details for users

app.get("/appliedjob/:id", authenticate, async function (req, res) {
    
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let jobs = await db.collection("appliedjobs").find({ email: req.params.id}).toArray();
        res.json(jobs)
        await connection.close();
    } catch (error) {
        console.log(error)
    }
})

//getting applied job details for recruiters

app.get("/viewcandidates/:id", authenticate, async function (req, res) {
    
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let jobs = await db.collection("appliedjobs").find({ recemail: req.params.id}).toArray();
        res.json(jobs)
        await connection.close();
    } catch (error) {
        console.log(error)
    }
})


app.get("/",(req,res)=>res.status(200).send("hello"));

app.listen(port,()=>console.log(`Listining on the port ${port}`))