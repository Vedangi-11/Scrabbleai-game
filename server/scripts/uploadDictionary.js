const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Dictionary = require("../src/models/Dictionary");

dotenv.config();

const filePath = path.join(process.cwd(), "data", "dictionary.txt");

async function uploadDictionary() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "scrabbleai",  // force correct DB
    });

    console.log("Connected to MongoDB:", mongoose.connection.name);

    const content = fs.readFileSync(filePath, "utf8");
    const words = content.split(/\r?\n/).filter(Boolean);

    console.log("Words found in file:", words.length);

    const docs = words.map((word) => ({
      word: word.toLowerCase(),
      length: word.length,
    }));

    console.log("Uploading dictionary... (this may take a minute)");

    // Insert in chunks to avoid memory issues
    const chunkSize = 5000;
    for (let i = 0; i < docs.length; i += chunkSize) {
      const chunk = docs.slice(i, i + chunkSize);
      await Dictionary.insertMany(chunk, { ordered: false });
      console.log(`Inserted ${Math.min(i + chunkSize, docs.length)} / ${docs.length}`);
    }

    const count = await Dictionary.countDocuments();
    console.log("Upload complete!");
    console.log("Documents in dictionary collection:", count);

    await mongoose.connection.close();
    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error uploading dictionary:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

uploadDictionary();

