const express=require("express")
const bodyParser=require("body-parser")
const ejs=require("ejs")
const mongoose=require("mongoose")


const app=express()
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

try{
  mongoose.connect("mongodb+srv://LokeshBandi:Annapurna%4005@cluster0.pgx8y.mongodb.net/SleepTracker?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true},()=>
  console.log("Connected")
);
}
catch(error){
  console.log("could not connect");
}
const userSchema=new mongoose.Schema({
  fullname: String,
  email :String,
  password: String
})
const dataSchema=new mongoose.Schema({
  fullname:String,
  email:String,
  date: String,
  startTime: String,
  endTime: String,
  duration: String
})
const user=new mongoose.model("Users",userSchema)
var userData=new mongoose.model("CustomerData",dataSchema)



//Home
app.get("/",function(req,res){
  res.render("home",{})
})
app.get("/register",function(req,res){
  res.render("register",{msg:" "})
})
app.get("/login",function(req,res){
  res.render("login",{msg:" "})
})
app.get("/userHome",function(req,res){
  res.render("index",{})
})




//Register
app.post("/register",function(req,res){
  var username=req.body.username
  var password=req.body.password
  var fullname=req.body.fullname
  var newUser=new user({
    fullname:fullname,
    email :username,
    password:password
  })
  user.findOne({email:username},function(err,foundUser){
    if(foundUser){
        var msg="!Already user present"
      res.render("register",{msg:msg})
    }
    else{
  newUser.save()
  res.render("index",{Email : username,Fullname:fullname, CustomerData:[]})
    }})

})


app.post("/userHome",function(req,res){

    var email=req.body.email
    var date=req.body.date
    var startTime=req.body.sleepTime
    var endTime=req.body.endTime
    var hour1=parseInt(startTime.slice(0,2))
    var hour2=parseInt(endTime.slice(0,2))
    var min1=parseInt(startTime.slice(3,5))
    var min2=parseInt(endTime.slice(3,5))
    
    var duration
    if(hour2>=hour1)
    {
      if(min2>=min1)
      {
      duration=parseFloat(hour2-hour1+((min2-min1)/60)).toFixed(2)
      }
      else{
        duration=parseFloat(hour2-1-hour1+((min2+min1)/60)).toFixed(2)
      }
    }
    else
    {
      if(min2>=min1)
      {
        console.log(24-hour1+hour2)
        duration=parseFloat((24-hour1)+hour2+((min2-min1)/60)).toFixed(2)
        console.log(duration)

      }
      else{
            duration=parseFloat((23-hour1)+hour2+((min1+min2)/60)).toFixed(2)
            console.log(duration)
      }
    }
    
    var fullname=req.body.fullname

    // var duration=(24-parseInt(startTime.slice(0,2))+parseInt(endTime.slice(0,2)))+":"+Math.abs(parseInt(startTime.slice(3,5))-parseInt(endTime.slice(3,5)))

    var newData=new userData({
      fullname:fullname,
      email:email,
      date:  date,
      startTime: startTime,
      endTime: endTime,
      duration:duration
    })

    newData.save().then(function(){
      userData.find({email:email},function(err, result) {
        if (err) throw err;
        res.render("index",{Email:email,Fullname:fullname,CustomerData:result})
      });
    })


})

//login
app.post("/login",function(req,res){
  var username=req.body.username
  var password=req.body.password

  user.findOne({email:username},function(err,foundUser){
    if(err){
      console.log("err");
    }
    else{
      if(foundUser){
      if(foundUser.password===password){
        userData.find({email:username},function(err, result) {
          if (err) throw err;
          res.render("index",{Email:username,Fullname:foundUser.fullname,CustomerData:result})
        });
      }
      else{
          var msg="!Incorrect password"
        res.render("login",{msg:msg})
      }
    }
    else{
        var msg="!Incorrect username"
        res.render("login",{msg:msg})
    }
    }
  })
})


app.listen(8000,function(){
  console.log("Server is running on 3000");
})
