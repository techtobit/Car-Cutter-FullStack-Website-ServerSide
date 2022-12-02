const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
var jwt = require('jsonwebtoken');
const app = express()
const cors = require('cors');
const port = 5001;

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
 res.send('hello world! Railway')
})
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.lcuk6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//function for all cars and inventory data
async function run() {

 try {
  await client.connect();
  const collection = client.db('assainment11').collection("items");

  // JWT Login Auth
  app.post('/login', async (req, res) => {
   const user = req.body;
   const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
    expiresIn: '1d'
   })
   res.send(accessToken)
  })


  //load multiple items data from database
  app.get('/inventory', async (req, res) => {
   const page = parseInt(req.query.page)
   const pageSize = parseInt(req.query.pageSize)
   const query = {}
   const cursor = collection.find(query)
   let items;
   if (page || pageSize) {
    items = await cursor.skip(page * pageSize).limit(pageSize).toArray();
   }
   else {
    items = await cursor.toArray();
   }

   res.send(items);
  })

  //Load single item data with id
  app.get('/inventory/:id', async (req, res) => {
   const id = req.params.id;
   const query = { _id: ObjectId(id) };
   const item = await collection.findOne(query)
   res.send(item);
  })

  //add new a items 
  app.post('/inventory', async (req, res) => {
   const newItem = req.body;
   const item = await collection.insertOne(newItem);
   res.send(item)
  })


  //Update Items Quantity
  app.put('/inventory/:id', async (req, res) => {
   const id = req.params.id;
   const updateQuantity = req.body;
   const filter = { _id: ObjectId(id) };
   const options = { upsert: true };
   const upDateQuantity = {
    $set: {
     quantity: updateQuantity.quantity
    }
   }
   const totalQuantity = await collection.updateOne(filter, upDateQuantity, options)

   res.send(totalQuantity);
  })

  //pagination
  app.get('/carsPagination', async (req, res) => {

   const query = {}
   const cursor = collection.find(query)
   const count = await cursor.count();
   res.send({ count })
  })

  //delete oneItems form database
  app.delete('/inventory/:id', async (req, res) => {
   const id = req.params.id;
   const query = { _id: ObjectId(id) };
   const deleteItem = await collection.deleteOne(query);
   res.send(deleteItem);
  })


 } catch (error) {
  console.log(error);
 }
}

run().catch(console.dir)


app.listen(port, () => {
 console.log(`Node Express is Running from 5001`);
})