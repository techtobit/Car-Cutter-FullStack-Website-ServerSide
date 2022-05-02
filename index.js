const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
 res.send('hello world!')
})


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.lcuk6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

 try {
  await client.connect();
  const collection = client.db('assainment11').collection("items");

  //load multiple items data from database
  app.get('/inventory', async (req, res) => {
   const query = {}
   const cursor = collection.find(query)
   const items = await cursor.toArray();
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
 console.log(`Node Express is Runging from ${port}`);
})