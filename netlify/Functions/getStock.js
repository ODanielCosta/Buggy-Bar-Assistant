const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
    console.log("Function getStock started");
    try {
        const uri = process.env.MONGODB_URI;
        console.log("MONGODB_URI:", uri);
        if (!uri) {
            console.error("MONGODB_URI is not set!");
            throw new Error('MONGODB_URI environment variable is not set.');
        }

        const client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db('BuggyBar');
        const stockCollection = db.collection('Stock');

        const stock = await stockCollection.find({}).toArray();

        // Add _id to each stock
        const stockWithId = stock.map(item => ({
            ...item,
            _id: item._id.toString() // Convert ObjectId to string
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(stockWithId),
        };
    } catch (error) {
        console.error('Error fetching stock:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch stock' }),
        };
    } finally {
        await client.close();
    }
};
