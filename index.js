const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const app = express()
const port =process.env.PORT || 5000

// middleware 

// password: yBRPjamYodFvFh0p
// userName: Hotel-Booking



const uri = "mongodb+srv://Hotel-Booking:yBRPjamYodFvFh0p@cluster0.vtrfwez.mongodb.net/?retryWrites=true&w=majority";

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

  

    app.get('/bookings',async(req,res)=>{
        const cursor = hotelBookingsCollection.find();
        const result = await cursor.toArray()
        res.send(result)

    })
    app.get('/bookings/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await hotelBookingsCollection.findOne(query);
        res.send(result)
    })

    app.get('/hotelBookings', async(req,res)=>{
       
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
    
        // Check if a booking already exists for the user and date
       
        const existingBooking = await bookingsCollection.findOne({
            email: bookingData.email,
            Price_per_night: bookingData.Price_per_night,
            

        });
    
        if (existingBooking) {
            return res.status(400).json({ message: "It is AllReady Selected" });
        } else {
            // Insert the new booking into the database
            const result = await bookingsCollection.insertOne(bookingData);
            res.status(200).json({ insertedId: result.insertedId });
        }
    });

    // review create 
    // app.post('/reviewBooking',async(req,res)=>{
    //   const reviewData = req.body;
    //   const result = await reviewCollection.insertOne(reviewData) 
    //   res.send(result)
    //   console.log(reviewData)
    // })

    app.post('/reviewBooking',async(req,res)=>{
      const reviewData = req.body;
      const result = await reviewCollection.insertOne(reviewData) 
      res.send(result)
      console.log(reviewData)
    })

    app.get('/hotelBookings',async(req,res)=>{
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
   app.get('/reviewBooking',async(req,res)=>{
    let query = {};
        if(req.query?.displayName){
          query = {displayName: req.query.displayName }
        }
        const cursor = reviewCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
   })
  

   

    // bookings Delete 
    app.delete('/hotelBookings/:id',async(req,res)=>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await reviewCollection.deleteOne(query);
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
    console.log('hitting',id,booking)
  })
    


       
  


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Hotel Bookings!')
})

app.listen(port, () => {
  console.log(`Hotel Booking Server Connect ${port}`)
})