const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ousunhm.mongodb.net/?retryWrites=true&w=majority`;

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


    const contestCollection = client.db('contestDB').collection('contests');
    const userCollection = client.db('contestDB').collection('users');

    // Post All Contest Data 
    app.post('/contests', async (req, res) => {
      const newContest = req.body;
      const result = await contestCollection.insertOne(newContest);
      res.send(result);
    })
    
    // Get All Contest Data 
    app.get('/contests', async (req, res) => {
      const cursor = contestCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Get Contest Single Data 
    app.get('/contests/:id', async (req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await contestCollection.findOne(query);
      res.send(result);
    })
 
    // User Related Api 
    app.get('/users', async (req, res)=>{
      const result = await userCollection.find().toArray();
      res.send(result);
    })
    app.post('/users', async (req, res)=>{
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'User Already Exist', insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })


    app.patch('/users/admin/:id', async (req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc ={
        $set:{
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })

    app.put('/users/admin/:id', async (req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc ={
        $set:{
          role: 'creator'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })

    // User Delete 
    app.delete('/users/:id', async (req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res)=>{
    res.send('Contest Hub is running')
})

app.listen(port, ()=>{
    console.log(`Contest Hub is running on port ${port}`);
})