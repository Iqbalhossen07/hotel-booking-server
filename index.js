const express = require('express')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const app = express()

const port =process.env.PORT || 5000

// middleware 
// app.use(cors({
//   origin:['http://localhost:5173',"http://127.0.0.1:5173"],
//   optionSuccessStatus:200,
//   credentials:true,methods: ["GET","POST","PATCH","PUT","DELETE"]
// }))

app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}))
app.use(cookieParser())
// app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vtrfwez.mongodb.net/?retryWrites=true&w=majority`;






// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const hotelBookingsCollection = client.db("Hotel_Booking").collection("bookings");
    const bookingsCollection = client.db("Hotel_Booking").collection("hotelBookings");
    const reviewCollection = client.db("Hotel_Booking").collection("reviewBooking");

  // jwt added 
  app.post('/jwt',async(req,res)=>{
    const user = req.body;
    // console.log('hitting jwt',user)
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    // cookie saved
    res
    .cookie('token', token,{
      httpOnly: true,
      secure:false,
    })
    .send({success: true})

    
  })

   //  verify token 
   const verifyToken = async(req,res,next)=>{
    const token = req.cookies.token;
    // console.log('token in the middle ware', token)
    if(!token){
      return res.status(401).send({message:"unauthorized"})
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
      if(err){
        return res.status(401).send({message:"unauthorized"})
      }
      req.user = decoded;
      next();
    });
  }


  // jwt post 
  app.post('/logout',async(req,res)=>{
    const user = req.body;
    console.log('logging out', user)
    res.clearCookie('token', {maxAge:0}).send({success:true})
  })


    app.get('/bookings', async(req,res)=>{
      // console.log('tok tok token',req.cookies.token)
      // if(req.query.email !== req.user.email){
      //   return res.status(403).send({message:"forbidden"})
      // }
        const cursor = hotelBookingsCollection.find();
        const result = await cursor.toArray()
        res.send(result)

    })
    app.get('/bookings/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await hotelBookingsCollection.findOne(query);
        res.send(result)
    })

     
    app.get('/hotelBookings',verifyToken, async(req,res)=>{
      console.log('tok tok token',req.cookies.token)
      if(req.query.email !== req.user.email){
        return res.status(403).send({message:"forbidden"})
      }

        let query = {};
        if(req.query?.email){
          query = {email: req.query.email }
        }
        const cursor = bookingsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

  




      // app.post('/hotelBookings',async(req,res)=>{
      //     const booking=req.body;
      //     const result = await bookingsCollection.insertOne(booking)
      //     res.send(result)
      // })
    app.post("/hotelBookings", async (req, res) => {
        const bookingData = req.body;
  
        const existingBooking = await bookingsCollection.findOne({
            email: bookingData.email,
            Price_per_night: bookingData.Price_per_night,
            

        });
    
        if (existingBooking) {
            return res.status(400).json({ message: "It is AllReady Selected" });
        } else {
            const result = await bookingsCollection.insertOne(bookingData);
            res.status(200).json({ insertedId: result.insertedId });
        }
    });

   

    app.post('/reviewBooking',async(req,res)=>{
      const reviewData = req.body;
      const result = await reviewCollection.insertOne(reviewData) 
      res.send(result)
      // console.log(reviewData)
    })

    app.get('/hotelBookings',async(req,res)=>{
      if(req.query.email !== req.user.email){
        return res.status(403).send({message:"forbidden"})
      }
      const cursor = hotelBookingsCollection.find();
        const result = await cursor.toArray()
        res.send(result) 
    })


   app.get('/hotelBookings/:id',async(req,res)=>{
      const id = req.params.id 
      const query = { _id: new ObjectId(id) };
      const movie = await bookingsCollection.findOne(query);
      res.send(movie)
      
    })

    // review get 
   app.get('/reviewBooking', async(req,res)=>{
    // if(req.query.displayName !== req.user.displayName){
    //   return res.status(403).send({message:"forbidden"})
    // }
    let query = {};
        if(req.query?.displayName){
          query = {displayName: req.query.displayName }
        }
        const cursor = reviewCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
   })
  


  //  this code 
  app.get('/checkBookingExists/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
  
    try {
      const result = await bookingsCollection.findOne(query);
  
      if (result) {
        // A booking exists for the room
        res.json({ bookingExists: true });
      } else {
        // No booking found for the room
        res.json({ bookingExists: false });
      }
    } catch (error) {
      console.error("Error checking booking existence:", error);
      res.status(500).json({ error: "An error occurred while checking booking existence" });
    }
  });
  
  
   

    // bookings Delete 
    app.delete('/hotelBookings/:id',async(req,res)=>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bookingsCollection.deleteOne(query);
        res.send(result)
      })

  // Update Booking

  app.get('/hotelBookings/:id',async(req,res)=>{
    const id = req.params.id 
    const query = { _id: new ObjectId(id) };
    const result = await bookingsCollection.findOne(query);
    res.send(result)
  })

  app.put('/hotelBookings/:id', async(req,res)=>{
    const booking = req.body;
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: { 
        displayName: booking.displayName, 
        email: booking.email,
        date: booking.date,
        Price_per_night: booking.Price_per_night,

      },
    };
    const result = await bookingsCollection.updateOne(filter, updateDoc, options);
    res.send(result)
    // console.log('hitting',id,booking)
  })
    


       
  


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// app.use(cors())
// app.use(express.json())


app.get('/', (req, res) => {
  res.send('Hotel Bookings!')
})

app.listen(port, () => {
  console.log(`Hotel Booking Server Connect ${port}`)
})