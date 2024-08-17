const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.95g0ypv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        const productsCollection = client.db("shoesDB").collection("allProducts");

        app.get('/products', async (req, res) => {
            const result = await productsCollection.find().toArray()
            res.send(result);
        })

        //pagination

        app.get('/allProducts', async (req, res) => {
            const size = parseInt(req.query.size)
            const page = parseInt(req.query.page) - 1
            console.log(size, page);
            const filter = req.query.filter
            const sort = req.query.sort
            const search = req.query.search

            let query = {
                ProductName: { $regex: search, $options: 'i' },
              }
            if (filter) query.Category = filter

            let options = {}
            if (sort) options = { sort: { Price: sort === 'asc' ? 1 : -1 } }

            // else if (filter) query = { BrandName: filter }
            const result = await productsCollection.find(query, options).skip(page * size).limit(size).toArray()
            res.send(result);
        })


        app.get('/productCount', async (req, res) => {
            const filter = req.query.filter
            const search = req.query.search
            let query = {
                ProductName: { $regex: search, $options: 'i' },
              }
            if (filter) query.Category = filter

            const count = await productsCollection.countDocuments(query)
            res.send({ count })
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

app.get('/', (req, res) => {
    res.send("Products server is running")
})

app.listen(port, () => {
    console.log(`Server is running port: ${port}`);

})