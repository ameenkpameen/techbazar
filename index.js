const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://ameenkp:ameenameen@cluster0.m2xibko.mongodb.net/Mytechbazar");

const express = require("express")
const app = express();
const path = require('path')
const session = require('express-session');
const nocache =require('nocache');

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))


app.use(session({
    secret:"key",
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:6000000}
}));
app.use(nocache());




app.use(express.static(path.join(__dirname, 'public')))

const admin_route =require('./routes/admin_route');
app.use('/admin',admin_route);


const user_Route = require('./routes/user_route');
// const { path } = require("./routes/user_route");
app.use('/',user_Route);

app.listen(3000,function(){
    console.log("server is running...");
})