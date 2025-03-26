const { MongoClient, ServerApiVersion } = require('mongodb');

exports.handler = async (event, context) => {
    console.log("Function getSales started");
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
        const salesCollection = db.collection('Sales');
        const currentDate = event.queryStringParameters.date; // Get the date from the query parameter

        const sales = await salesCollection.find({ date: currentDate }).toArray();

        return {
            statusCode: 200,
            body: JSON.stringify(sales),
        };
    } catch (error) {
        console.error('Error fetching sales:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch sales' }),
        };
    } finally {
        await client.close();
    }
};
