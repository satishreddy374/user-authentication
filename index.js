const express = require('express');
const mongoose = require('mongoose');
const Registeruser = require('./model');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const cors = require('cors');
const app = express();

mongoose.connect("mongodb+srv://satish:mongodb374@cluster0.ltudgvf.mongodb.net/usersDatabase?retryWrites=true&w=majority").then(
    () => console.log('DB Connection established....')
)

app.use(express.json());
app.use(cors({origin:"*"}))

// Register API

app.post('/register',async (req, res) =>{
    try{
        const {username,email,password,confirmpassword} = req.body;
        let exist = await Registeruser.findOne({email})
        if(exist){
            return res.send('User Already Exist...')
        }
        if(password !== confirmpassword){
            return res.send('Passwords is not matching...');
        }
        let newUser = new Registeruser({
            username,
            email,
            password,
            confirmpassword
        })
        await newUser.save();
        res.status(200).send('Registered Successfully...')
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Internel Server Error')
    }
})

// Login API 

app.post('/login',async (req, res) => {
    try{
        const {email,password} = req.body;
        let exist = await Registeruser.findOne({email});
        if(!exist) {
            return res.send('Unauthorized User. User is Not Registered...');
        }
        if(exist.password !== password) {
            return res.send('Password is Incorrect...');
        }
        
        let payload = {
            user:{
                id : exist.id
            }
        }
        jwt.sign(payload,'jwtSecret',{expiresIn:3600000},
          (err,token) =>{
              if (err) throw err;
              return res.json({token})
          }  
            )
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Server Error')
    }
})


// Home Page

app.get('/',middleware,async(req, res)=>{
    try{
        let exist = await Registeruser.findById(req.user.id);
        if(!exist){
            return res.status(400).send('User not found');
        }
        res.json(exist);
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Server Error')
    }
})


app.listen(5000,()=>{
    console.log('Server running at port 5000...')
})





