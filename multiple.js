const { MongoClient } = require("mongodb");

async function watchMultipleCollections() {
  const uri = "mongodb://localhost:27017/?replicaSet=rs0&directConnection=true";
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();

    const database = client.db("hello");

    // List of collections to watch
    const collectionsToWatch = ["world", "mars"];

    collectionsToWatch.forEach((collectionName) => {
      const collection = database.collection(collectionName);

      // Create a change stream on each collection
      const changeStream = collection.watch();

      console.log(`Watching for changes in ${collectionName}...`);

      // Set up a listener when a change occurs
      changeStream.on("change", (next) => {
        console.log(`Change detected in ${collectionName}: `, next);
      });
    });
  } catch (err) {
    console.error(err);
  }
}

watchMultipleCollections();
