const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT ||5000
const app = express()

app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qcus7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
    const taskCollection = client.db('NextTaskCollection').collection('task')

    const completedTaskCollection = client.db('NextTaskCollection').collection('completedTask')

    const userCollection = client.db('NextTaskCollection').collection('users')

    app.get('/tasks',async(req,res)=>{
        const cursor = taskCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/tasks/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await taskCollection.findOne(query)
        res.send(result)
    })

    app.post('/users',async(req,res)=>{
      const user = req.body;
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    app.post('/tasks',async(req,res)=>{
        const task = req.body;
        const result = await taskCollection.insertOne(task)
        res.send(result)
    })

    app.get('/completedTask',async(req,res)=>{
      const cursor = completedTaskCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/completedTask', async(req,res)=>{
        const task = req.body;
        const result = await completedTaskCollection.insertOne(task)
        res.send(result)
    })

    app.delete('/tasks/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result =await taskCollection.deleteOne(query)
        res.send(result)
    })

    app.delete('/completedTask',async(req,res)=>{
      const result = completedTaskCollection.deleteMany()
      res.send(result)
    })

    app.put('/tasks/editTask/:id',async(req,res)=>{
        const id = req.params.id;
        const filter ={_id: new ObjectId(id)}
        const option = {upsert :false}
        const data = req.body;
        const updatedData = {
            $set :{
                dataFormate : data.dataFormate,
                dataType : data.dataType,
                expireData : data.expireData,
                title : data.title,
                task : data.task,
                date : data.date
            }
        }
        const result = await taskCollection.updateOne(filter,updatedData,option)
        res.send(result)
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('TaskNext Server Is Running')
})

app.listen(port,(req,res)=>{
    console.log('NextTask Server is Running of port', port)
})