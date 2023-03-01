const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();

// middelware
app.use(cors());
app.use(express.json());


// ---------- Database Connect -------------
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrnvqzi.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('database connected')

async function run(){
    try {
      const servicesCollection = client.db('creative_agency').collection('services')


    // Get all services from the Database
    app.get('/services', async(req, res)=>{
    const query = {};
    const cursor  = servicesCollection.find(query);
    const result = await cursor.toArray();
    res.send(result)

    // Get a Single service from the database
    app.get('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id : new ObjectId(id) }
      const service = await servicesCollection.findOne(query);
      res.send(service);
    })
})} 
    finally {
      // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Running agency Server')
})

app.listen(port, ()=>{
    console.log('Listening to port', port);
})