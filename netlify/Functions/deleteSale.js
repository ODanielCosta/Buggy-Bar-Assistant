const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
    console.log("Function deleteSale started");
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
        const purchaseId = event.path.split('/').pop(); // Get the ID from the URL path

        const result = await salesCollection.deleteOne({ _id: new ObjectId(purchaseId) });

        if (result.deletedCount === 1) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Purchase deleted successfully' }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Purchase not found' }),
            };
        }
    } catch (error) {
        console.error('Error deleting purchase:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete purchase' }),
        };
    } finally {
        await client.close();
    }
};
