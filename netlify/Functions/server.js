// server.js
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

console.log(process.env.MONGODB_URI);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
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
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        //await client.close();
    }
}
run().catch(console.dir);

// ... (your existing /api/sales routes) ...

app.post('/api/sales', async (req, res) => {
    try {
        const db = client.db('BuggyBar');
        const salesCollection = db.collection('Sales');
        const purchaseData = req.body;
        purchaseData.date = purchaseData.date.split('T')[0]; // Remove the time from the date
        const result = await salesCollection.insertOne(purchaseData);
        res.status(201).json({ message: 'Sale recorded successfully', insertedId: result.insertedId });
    } catch (error) {
        console.error('Error recording sale:', error);
        res.status(500).json({ error: 'Failed to record sale' });
    }
});

app.delete('/api/sales/:id', async (req, res) => {
    try {
        const db = client.db('BuggyBar');
        const salesCollection = db.collection('Sales');
        const purchaseId = req.params.id;
        const result = await salesCollection.deleteOne({ _id: new ObjectId(purchaseId) });
        if (result.deletedCount === 1) {
            res.json({ message: 'Purchase deleted successfully' });
        } else {
            res.status(404).json({ error: 'Purchase not found' });
        }
    } catch (error) {
        console.error('Error deleting purchase:', error);
        res.status(500).json({ error: 'Failed to delete purchase' });
    }
});

app.get('/api/sales', async (req, res) => {
    try {
        const db = client.db('BuggyBar');
        const salesCollection = db.collection('Sales');
        const currentDate = req.query.date; // Get the date from the query parameter
        const sales = await salesCollection.find({ date: currentDate }).toArray(); // Filter by date
        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
});

app.post('/api/sales', async (req, res) => {
    try {
        const db = client.db('BuggyBar');
        const salesCollection = db.collection('Sales');
        const purchaseData = req.body;
        purchaseData.date = purchaseData.date.split('T')[0]; // Remove the time from the date
        const result = await salesCollection.insertOne(purchaseData);
        res.status(201).json({ message: 'Sale recorded successfully', insertedId: result.insertedId });
    } catch (error) {
        console.error('Error recording sale:', error);
        res.status(500).json({ error: 'Failed to record sale' });
    }
});


app.get('/api/stock', async (req, res) => { // New GET endpoint for stock
    try {
        const db = client.db('BuggyBar');
        const stockCollection = db.collection('Stock');
        const stock = await stockCollection.find({}).toArray();
        res.json(stock);
    } catch (error) {
        console.error('Error fetching stock:', error);
        res.status(500).json({ error: 'Failed to fetch stock' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
