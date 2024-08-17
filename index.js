
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.95g0ypv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const productsCollection = client.db("shoesDB").collection("allProducts");

        app.get('/allProducts', async (req, res) => {
            const size = parseInt(req.query.size) || 10;
            const page = parseInt(req.query.page) - 1 || 0;
            const filter = req.query.filter || '';
            const sort = req.query.sort || '';
            const search = req.query.search || '';
        
            let query = {
                ProductName: { $regex: search, $options: 'i' },
            };
        
            // Filter by category or brand name
            if (filter) {
                if (filter.startsWith('PriceRange')) {
                    const priceRange = filter.replace('PriceRange', '');
                    if (priceRange === '1') query.Price = { $gte: 0, $lte: 100 };
                    else if (priceRange === '2') query.Price = { $gte: 101, $lte: 500 };
                    else if (priceRange === '3') query.Price = { $gte: 501, $lte: 1500 };
                } else if (filter.startsWith('BrandName')) {
                    const brandName = filter.replace('BrandName', '');
                    query.BrandName = brandName;
                } else {
                    query.Category = filter;
                }
            }
        
            const options = sort ? { sort: { Price: sort === 'asc' ? 1 : -1 } } : {};
        
            try {
                const result = await productsCollection.find(query, options).skip(page * size).limit(size).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });
        

        app.get('/productCount', async (req, res) => {
            const filter = req.query.filter || '';
            const search = req.query.search || '';
        
            let query = {
                ProductName: { $regex: search, $options: 'i' },
            };
        
            if (filter) {
                if (filter.startsWith('PriceRange')) {
                    const priceRange = filter.replace('PriceRange', '');
                    if (priceRange === '1') query.Price = { $gte: 0, $lte: 100 };
                    else if (priceRange === '2') query.Price = { $gte: 101, $lte: 500 };
                    else if (priceRange === '3') query.Price = { $gte: 501, $lte: 1500 };
                } else if (filter.startsWith('BrandName')) {
                    const brandName = filter.replace('BrandName', '');
                    query.BrandName = brandName;
                } else {
                    query.Category = filter;
                }
            }
        
            try {
                const count = await productsCollection.countDocuments(query);
                res.send({ count });
            } catch (error) {
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });
        

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Products server is running");
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
