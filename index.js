const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();



app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aahhdce.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    const database = client.db("productsDB");
    const productsCollection = database.collection("products")
    app.get('/brands/:name', async (req, res) => {
        const brandName = req.params.name;
        const query = {brand: { $regex: new RegExp(brandName, 'i') }};
        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();
        res.send(products)
    })
    app.post('/products', async (req, res)=>{
        const product = req.body; 
        const result = await productsCollection.insertOne(product);
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



app.get('/', (req, res)=> {
    res.send('server connected')
})

app.listen(port, ()=>{
    console.log(`connected to port ${port}`)
})