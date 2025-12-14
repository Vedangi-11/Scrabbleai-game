import fs from "fs";
import path from "path";

const dictPath = path.join(process.cwd(), "src", "data", "dictionary.txt");
const words = fs.readFileSync(dictPath, "utf8")
  .split(/\r?\n/)
  .map(w => w.trim().toUpperCase())
  .filter(w => w.length >= 2 && w.length <= 7);
export const WORD_LIST = words;
export const WORD_SET = new Set(words);