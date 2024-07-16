const { MongoClient } = require("mongodb");
const fs = require("fs").promises;

// Connection URI
const uri = "mongodb://localhost:27017/?replicaSet=rs0&directConnection=true";

// Database and Collection
const dbName = "hello";
const collectionName = "world";

// Path to the file where resume token will be stored
const resumeTokenFilePath = "resume_token.json";

// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function watchChanges() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Select the database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Initialize the change stream with an optional resume token
    let changeStream;
    const resumeToken = await getResumeToken();

    if (resumeToken && resumeToken._data != "") {
      changeStream = collection.watch([], {
        fullDocument: "updateLookup",
        resumeAfter: resumeToken,
      });
    } else {
      changeStream = collection.watch();
    }

    console.log("Watching for changes...");

    // Set up a listener for changes
    changeStream.on("change", async (change) => {
      console.log("=== Change detected ===");
      console.log(JSON.stringify(change));

      // Save the resume token
      await saveResumeToken(change._id);
    });

    // Handle errors
    changeStream.on("error", async (error) => {
      console.error("Error in change stream:", error);

      // Close the current stream and reconnect
      changeStream.close();
      await watchChanges();
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

async function getResumeToken() {
  try {
    const data = await fs.readFile(resumeTokenFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // File not found, meaning no resume token is saved yet
      return null;
    }
    throw error;
  }
}

async function saveResumeToken(token) {
  await fs.writeFile(resumeTokenFilePath, JSON.stringify(token));
  console.log("Resume token saved:", token);
}

// Start watching for changes
watchChanges();
