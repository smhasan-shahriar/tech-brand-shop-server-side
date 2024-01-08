const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    // await client.connect();
    const database = client.db("productsDB");
    const productsCollection = database.collection("products");
    const cartCollection = database.collection('cart');
    app.get('/mycart', async(req, res)=>{
        const cursor = cartCollection.find();
        const cartProducts = await cursor.toArray();
        res.send(cartProducts)
    })
    app.post('/mycart', async(req, res)=> {
        const cartProduct = req.body; 
        const result = await cartCollection.insertOne(cartProduct);
        res.send(result);
 
    })
    app.delete('/mycart/:id', async(req, res) => {
        const id = req.params.id;
        const email = req.body.email;
        const query = {productId: id, email};
        console.log(query)
        const result = await cartCollection.deleteOne(query);
        res.send(result)

    })
    app.get('/products', async(req, res)=> {
        const cursor = productsCollection.find();
        const products = await cursor.toArray();
        res.send(products)
    })
    app.get('/brands/:name', async (req, res) => {
        const brandName = req.params.name;
        const query = {brand: { $regex: new RegExp(brandName, 'i') }};
        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();
        res.send(products)
    })
    app.get('/products/:id', async(req, res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const product = await productsCollection.findOne(query);
        res.send(product)
    })
    app.delete('/deleteproduct/:id', async(req, res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await productsCollection.deleteOne(query);
        res.send(result)
    })
    app.get('/updateproducts/:id', async(req,res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const product = await productsCollection.findOne(query);
        res.send(product)
    })

    app.put('/updateproducts/:id', async(req, res) =>{
        const id = req.params.id;
        const updatedProduct = req.body
        const filter = {_id: new ObjectId(id)};
        const options = {upsert: false};
        const updateProduct = {
            $set:{
                name: updatedProduct.name, 
                image: updatedProduct.image, 
                brand: updatedProduct.brand, 
                price: updatedProduct.price, 
                rating: updatedProduct.rating, 
                type: updatedProduct.type
            }
        }
        const result = await productsCollection.updateOne(filter, updateProduct, options);
        res.send(result)
    })
    app.post('/products', async (req, res)=>{
        const product = req.body; 
        const result = await productsCollection.insertOne(product);
        res.send(result);
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=> {
    res.send('server connected successfully')
})

app.listen(port, ()=>{
    console.log(`connected to port ${port}`)
})