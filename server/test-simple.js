import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Attempting connection...');
    
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    const db = client.db('dareU');
    const result = await db.collection('test').insertOne({ hello: 'world', timestamp: new Date() });
    console.log('Insert worked:', result.insertedId);
    
    await client.close();
    
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

test();