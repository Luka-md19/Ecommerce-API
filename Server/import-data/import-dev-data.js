const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "../config.env" });

const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

const encodedPassword = encodeURIComponent(process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE.replace("<PASSWORD>", encodedPassword);

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.error("DB connection error:", err));

// Load JSON data
const categories = JSON.parse(
  fs.readFileSync(path.join(__dirname, "categories.json"), "utf-8")
);
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products.json"), "utf-8")
);

// Import data into the database
const importData = async () => {
  try {
    await Category.create(categories);
    await Product.create(products);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.error("Error loading data:", err);
  }
  process.exit();
};

// Delete all data from the database
const deleteData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    console.log("Data deleted successfully");
  } catch (err) {
    console.error("Error deleting data:", err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

// Display command line arguments (for debugging purposes)
console.log(process.argv);
