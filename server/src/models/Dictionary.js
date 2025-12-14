const mongoose=require("mongoose");

const DictionarySchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
 length: { type: Number, required: true }
});
module.exports= mongoose.model("Dictionary", DictionarySchema);