// netlify/Functions/createSale.js
const { MongoClient, ServerApiVersion } = require('mongodb');

exports.handler = async (event, context) => {
  console.log("Function createSale started");
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

    const purchaseData = JSON.parse(event.body); // Get data from the request body
    purchaseData.date = purchaseData.date.split('T')[0]; // Remove the time from the date

    const result = await salesCollection.insertOne(purchaseData);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Sale recorded successfully', insertedId: result.insertedId }),
    };
  } catch (error) {
    console.error('Error recording sale:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to record sale' }),
    };
  } finally {
    await client.close();
  }
};
