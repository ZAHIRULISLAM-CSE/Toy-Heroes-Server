const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tzxjncj.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // Send a ping to confirm a successful connection

    const toyCollection = client.db("toyDatabase").collection("toys");

    // const indexKey = { toyName: 1 };
    // const indexOptions = { name: "toyName" };
    // const result = await toyCollection.createIndex(indexKey, indexOptions);

    //get all data
    app.get("/alltoys", async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    });

    //getEach singleToy DEtails
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // get toys of a specific userSelect with assending and desending:
    app.get("/toy/:email", async (req, res) => {
      const email = req.params.email;
      const queryParams = req.query.price;
      const query = { sellerEmail: email };
      let store = [
        { $match: query },
        {
          $addFields: {
            toyPriceNumeric: { $toInt: "$toyPrice" },
          },
        },
      ];
      if (queryParams) {
        console.log("okk");
        store.push({
          $sort: { toyPriceNumeric: queryParams === "asc" ? 1 : -1 },
        });
      }
      const result = await toyCollection.aggregate(store).toArray();
      res.send(result);
    });

    //get toys by category
    app.get("/catagory/:text", async (req, res) => {
      const text = req.params.text;
      const query = { toyCatagory: text };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    //search with text
    app.get("/searchToys/:text", async (req, res) => {
      const text = req.params.text;
      const query = {
        toyName: { $regex: text, $options: "i" },
      };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/addtoys", async (req, res) => {
      const toyData = req.body;
      console.log(toyData);
      const result = await toyCollection.insertOne(toyData);
      res.send(result);
    });

    //update toyData
    app.patch("/update", async (res, req) => {
      const updatedData = res.body;
      const id = updatedData.id;
      const price = updatedData.toyPrice;
      const quantity = updatedData.toyQuantity;
      const des = updatedData.toyDescription;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          toyPrice: price,
          toyQuantity: quantity,
          toyDescription: des,
        },
      };

      const result = await toyCollection.updateOne(filter, updateDoc);
      req.send(result);
    });

    //delete funcionality here
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
