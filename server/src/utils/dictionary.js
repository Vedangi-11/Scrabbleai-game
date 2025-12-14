import fs from "fs";
import path from "path";

let wordSet = null;

export function loadDictionary() {
  if (wordSet) return wordSet;
  const p = path.join(process.cwd(), "src", "data", "dictionary.txt");
  try {
    const text = fs.readFileSync(p, "utf8");
    wordSet = new Set(
      text
        .split(/\r?\n/)
        .map(w => w.trim().toUpperCase())
        .filter(Boolean)
    );
    console.log("Dictionary loaded");
  } catch (err) {
    console.error("Dictionary load failed at:", p);
    console.error(err.message);
    wordSet = new Set();
  }
  return wordSet;
}
export function isValidWord(word) {
  const set = loadDictionary();
  return set.has(word.trim().toUpperCase());
}
