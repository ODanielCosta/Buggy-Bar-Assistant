const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
    console.log("Function updateStock started");
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

        const stockData = JSON.parse(event.body); // Get data from the request body

        // Update each stock item
        const updatePromises = stockData.map(async item => {
            const result = await stockCollection.updateOne(
                { _id: new ObjectId(item._id) }, // Find by _id
                { $set: { initialQuantity: item.initialQuantity, originalQuantity: item.originalQuantity } } // Update quantities
            );
            return result;
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Stock updated successfully' }),
        };
    } catch (error) {
        console.error('Error updating stock:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update stock' }),
        };
    } finally {
        await client.close();
    }
};
