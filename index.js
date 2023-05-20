const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4laett8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    // Set collection
    const toyCollection = client.db("toyDB").collection("toys");

    // Get All toys
    // app.get("/toys", async (req, res) => {
    //   const result = await toyCollection
    //     .find()
    //     .sort({ createdAt: -1 })
    //     .toArray();
    //   res.send(result);
    // });
    // Get single toy
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });
    // Get toys by email
    // app.get("/toys/:email", async (req, res) => {
    //   console.log(req.params.id);
    //   const toys = await toyCollection
    //     .find({
    //       sellerEmail: req.params.email,
    //     })
    //     .toArray();
    //   res.send(toys);
    // });
    // post a toy

    app.get("/toys", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await toyCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      console.log(body);
      const result = await toyCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again later",
          status: false,
        });
      }
    });
    // Update a toy
    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: body.title,
          price: body.price,
          category: body.category,
          quantity: body.quantity,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // Delete a toy
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tiny toy is running");
});
app.listen(port, () => {
  console.log(`Tiny toy is running on port: ${port}`);
});
