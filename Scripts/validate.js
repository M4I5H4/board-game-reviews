// Install AJV first:
// npm install ajv

//run node scripts/validate.js

const Ajv = require("ajv");
const fs = require("fs");

// Load your schema
const schema = JSON.parse(fs.readFileSync("Dataset/gameSchema.json", "utf-8"));

// Load your dataset
const dataset = JSON.parse(fs.readFileSync("Dataset/boardGames.json", "utf-8"));

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const valid = validate(dataset);

if (valid) {
  console.log("✅ Dataset is valid!");
} else {
  console.log("❌ Dataset is invalid!");
  console.log(validate.errors);
}
