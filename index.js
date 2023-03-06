const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

// Varify JWT Token
function varifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
   return res.status(401).send({message: 'unauthorized access'})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      return res.status(401).send({message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  })
}

async function run(){
    try {
      const servicesCollection = client.db('creative_agency').collection('services')
      const ordersCollection = client.db('creative_agency').collection('orders')


    // --- JWT Token  ---
    // --- Create A JWT Token ---
    app.post('/jwt', (req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10h'})
      res.send({token});
    })

    // ----- READ ----- Get all services from the Database
    app.get('/services', async(req, res)=>{
    const query = {};
    const cursor  = servicesCollection.find(query);
    const result = await cursor.toArray();
    res.send(result)
  },
    // ----- READ ----- Get a Single service for serviceDetails page
    app.get('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id : new ObjectId(id) }
      const service = await servicesCollection.findOne(query);
      res.send(service);
    }),
    
      // ----- READ ----- Get Single service for checkout page
      app.get('/checkout/:id', async(req, res)=>{
        const id = req.params.id;
        const query = { _id : new ObjectId(id)}
        const result = await servicesCollection.findOne(query);
        res.send(result);
      }),

      // ----------- Order API ----------
      // ----- READ ----- Get all orders for a user using Get & query
      app.get('/orders', varifyJWT, async(req, res)=>{
        const decoded = req.decoded;
        if(decoded.email !== req.query.email){
          res.status(403).send({message: 'unauthorized access'})
        }

        let query = {};
        if(req.query.email){
          query = {
            email: req.query.email
          }
        }
        const cursor = ordersCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      }),

      // --- CREATE ---  using post 
      app.post('/orders', async(req, res)=>{
        const order = req.body;
        const result = await ordersCollection.insertOne(order);
        res.send(result);
      }),

      // --- UPDATE ---- 
      app.patch('/orders/:id', async(req, res)=>{
        const id = req.params.id;
        const status = req.body.status;
        const query = {_id: new ObjectId(id)}
        const updatedDoc = {
          $set:{
            status: status
          }
        }
        const result = await ordersCollection.updateOne(query, updatedDoc);
        res.send(result);
      }),

      // --- DELETE --- Order
      app.delete('/orders/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await ordersCollection.deleteOne(query);
        res.send(result);
      }),

   
)} 
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