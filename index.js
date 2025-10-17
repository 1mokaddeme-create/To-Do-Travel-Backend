const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const Destinations = require ("./Models/destinations")
const Tours = require ("./Models/tours")
const UsersDestinations = require ("./Models/usersDestinations")
const UsersTours = require("./Models/usersTours")
const User = require("./Models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const authMiddleware = require("./middlewares/authMiddleware")
const usersDestinations = require("./Models/usersDestinations")
const destinations = require("./Models/destinations")
const usersTours = require("./Models/usersTours")


const app = express()

app.use(express.json())
app.use(cors({
    origin:["https://todo-travel-agency.netlify.app"]
}))

app.get("/destinations", async (req,res)=>{
    try {
        const destinations = await Destinations.find()

        if(!destinations) {
           return  res.status(404).json({message:"No destinations"})
        }

        res.status(200).json({message:"Destinations: ",data:destinations})
    } catch (error) {
            res.status(500).json({message:"something went wrong"})
    }
})

app.post("/destinations", async (req,res)=>{
    try {
        const newDestination = new Destinations({
            name : req.body.name,
            description: req.body.description,
            image: req.body.image
        })

        await newDestination.save()

        res.status(201).json({message:"new destinations added",data:newDestination})
    } catch (error) {
        res.status(500).json({message:"something went wrong"})
    }
})

app.get("/destinations/:name", async(req,res)=>{
    try {
        const destinationName = req.params.name

        const destination = await Destinations.findOne({name : destinationName})
        if(!destination){
            return res.status(404).json({message:"destination not found"})
        }

        res.status(200).json({data:destination})

    } catch (error) {
        res.status(500).json({message:"something went wrong"})
    }
})

app.get("/tours", async (req,res)=>{
    try {
        const tours = await Tours.find()

        if(!tours) {
            res.status(404).json({message:"No tours"})
        }

        res.status(200).json({message:"Tours: ",data:tours})
    } catch (error) {
            res.status(500).json({message:"something went wrong"})
    }
})

app.get("/tours/:name", async (req,res)=>{
    try {
        const tourName = req.params.name

        const tour = await Tours.findOne({name: tourName})
        if(!tour){
            res.status(404).json({message:"tour not found"})
        }

        res.status(200).json({data:tour})
    } catch (error) {
        res.status(500).json({message:"something went wrong"})
    }
})

app.post("/tours", async (req,res)=>{
    try {
        const newTour = new Tours({
            name : req.body.name,
            description: req.body.description,
            price: req.body.price,
            date: req.body.date,
            image: req.body.image,
            images: req.body.images
        })

        await newTour.save()

        res.status(201).json({message:"new tour added",data:newTour})
    } catch (error) {
        res.status(500).json({message:"something went wrong"})
    }
})

app.post("/user/destination", authMiddleware, async (req,res)=>{
    try {


        const {destination, date} = req.body


        if(!destination){
            return res.status(400).json({message:"destination is required"})
        }

        if(!date){
            return res.status(400).json({message:"the date is required"})
        }

        // console.log(req.user.userId)



        const userInofs = await User.findById(req.user.userId).select("name email phoneNumber")
        // console.log(userInofs)
        
        if(!userInofs){
            return res.status(400).json({message:"user does not exist"})
        }

        // console.log(userInofs)

        const newBooking = new usersDestinations({
            user: {
              _id: req.user?.userId,
              name: userInofs?.name,
              email: userInofs?.email,
              phoneNumber: userInofs?.phoneNumber,
            },
            destination,
            date,
        })

        await newBooking.save()

        res.status(201).json({message:"user booked "})
    } catch (error) {
        res.status(500).json({message:"something went wrong"})
    }
})


app.post("/user/tour", authMiddleware, async (req, res) => {
  try {
    const { tour, members } = req.body;

    console.log("1")
    if(!tour){
        return res.status(400).json({message:"Tour is required"})
    }
    if(!members){
        return res.status(400).json({message:"Number of members is required"})
    }
    if(members<1){
        return res.status(400).json({message:"members should be 1 or more"})
    }

    console.log("2")
 
    const userInfos = await User.findById(req.user?.userId).select("name email phoneNumber")
    console.log("user infos: " ,userInfos)
 
    const bookedTour = await Tours.findById(tour).select("name")
    console.log("tour infos: ", bookedTour)
   
    const newBooking = new UsersTours({
      user:{
        _id: req.user?.userId,
        name: userInfos?.name,
        email: userInfos?.email,
        phoneNumber: userInfos?.phoneNumber,
      },
      tour:{
        _id: bookedTour._id,
        name: bookedTour?.name,
      },
      members
    });

    const saved = await newBooking.save();

    return res.status(201).json({ message: "Tour booked successfully", booking: saved });
  } catch (error) {
    console.error("Error creating booking:", error);               // <-- IMPORTANT: print error
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});


app.post("/register", async (req,res)=>{gi
    try {
        const {name, email, phoneNumber, wilaya, password} = req.body

       if(!name || !email || !password || !phoneNumber || !wilaya){
         return res.status(400).json({message:"you need to fill all your informations"})
       }
       
       const checkuser = await User.findOne({email: email})

       if(checkuser){
          return res.status(400).json({message:"Invalid email, Try another"})
       }

       const hashedPass = await bcrypt.hash(password, 12)

       const newUser = new User({
          name: name,
          email: email,
          phoneNumber: phoneNumber,
          wilaya: wilaya,
          password: hashedPass
       })

      newUser.save()

      const token = jwt.sign({userId: newUser._id, username: newUser.name}, "travel-web",{expiresIn: "1h"})

      res.status(200).json({message:"new user registred", token:token})

    } catch (error) {
      res.status(500).json({message:"something went wrong"})   
    }
})

app.post("/login", async (req,res)=>{
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({message:"you need to fill all inputs"})
        }

        const checkUser = await User.findOne({email: email})

        if(!checkUser){
            return res.status(401).json({message:"Email does not exists"})
        }

        const checkPassword = await bcrypt.compare(password, checkUser.password)

        if(!checkPassword){
            return res.status(401).json({message:"Wrong Password"})
        }
        checkUser.password = undefined
        const token = jwt.sign({userId: checkUser._id, username: checkUser.name}, "travel-web",{expiresIn: "1h"})

        res.status(200).json({message:"user logged in succesfully",userData:checkUser,token:token})
    } catch (error) {
           res.status(500).json({ message: "Something went wrong"});

    }
})

app.get("/myBookings", authMiddleware, async(req,res)=>{

    console.log("1-before")

     try {
        const bookingDestinations = await usersDestinations.find({"user._id": req.user.userId})
        console.log(bookingDestinations)
        const bookingsTours = await usersTours.find({"user._id" : req.user.userId})
        console.log(bookingsTours)
        

        res.status(200).json({tours:bookingsTours, destinations:bookingDestinations})
     } catch (error) {
        res.status(500).json({message:"something went wrong"})
     }

})

app.get("/myProfile", authMiddleware, async(req,res)=>{
    try {
        const userInfos = await User.findOne({_id: req.user.userId}).select("-password")

        if(!userInfos){
            return res.status(404).json({message:"user does not exist"})
        }

        res.status(200).json(userInfos)

    } catch (error) {
        res.status(500).json({message:"something went wrong"})
    }
})



// mongoose.connect("mongodb://localhost:27017/Travel-web", {
//     serverSelectionTimeoutMS: 5000
// })

//    .then(()=>{
//     console.log("connected")
//     app.listen(4000, (req,res)=>{
//         console.log("server is running")
//     })
//    }).catch((err)=>{
//     console.log(err)
//    })

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/Travel-web", {
    serverSelectionTimeoutMS: 10000
})

  .then(() => {
      console.log("Connected to database")
      const PORT = process.env.PORT || 4000;
      app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`)
      })
  })
 .catch((err) => {
      console.log("Database connection error:", err)
  })