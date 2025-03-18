const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Generate ObjectId manually for categories and products
const { Types: { ObjectId } } = mongoose;

// Define parent categories
const parentCategories = [
  {
    _id: new ObjectId(),
    name: "Electronics",
    description: "Devices and gadgets",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Home Appliances",
    description: "Appliances for home use",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Fashion",
    description: "Clothing, footwear, and accessories",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Books",
    description: "Books, magazines, and educational material",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Sports Equipment",
    description: "Gear and accessories for various sports",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Define subcategories
const subcategories = [
  {
    _id: new ObjectId(),
    name: "Smartphones",
    description: "Mobile phones and accessories",
    parentCategoryId: parentCategories[0]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Laptops",
    description: "Laptops and notebooks",
    parentCategoryId: parentCategories[0]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Refrigerators",
    description: "Home and kitchen refrigerators",
    parentCategoryId: parentCategories[1]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Men's Clothing",
    description: "Clothing and accessories for men",
    parentCategoryId: parentCategories[2]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Women's Clothing",
    description: "Clothing and accessories for women",
    parentCategoryId: parentCategories[2]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Fiction Books",
    description: "Fictional books and novels",
    parentCategoryId: parentCategories[3]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Non-Fiction Books",
    description: "Non-fictional books and educational material",
    parentCategoryId: parentCategories[3]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Fitness Equipment",
    description: "Gym and fitness equipment",
    parentCategoryId: parentCategories[4]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Outdoor Sports",
    description: "Equipment for outdoor sports",
    parentCategoryId: parentCategories[4]._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Define products for each subcategory
const products = [
  // Products for Smartphones
  {
    _id: new ObjectId(),
    name: "iPhone 13",
    description: "Latest Apple smartphone with A15 Bionic chip.",
    price: 999.99,
    categories: [subcategories[0]._id],
    inventoryCount: 50,
    images: [
      "https://example.com/images/iphone-13-1.jpg",
      "https://example.com/images/iphone-13-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Samsung Galaxy S21",
    description: "High-end Samsung smartphone with 128GB storage.",
    price: 799.99,
    categories: [subcategories[0]._id],
    inventoryCount: 70,
    images: [
      "https://example.com/images/galaxy-s21-1.jpg",
      "https://example.com/images/galaxy-s21-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Google Pixel 6",
    description: "Google's flagship smartphone with pure Android experience.",
    price: 699.99,
    categories: [subcategories[0]._id],
    inventoryCount: 40,
    images: [
      "https://example.com/images/pixel-6-1.jpg",
      "https://example.com/images/pixel-6-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "OnePlus 9",
    description: "Fast and smooth experience with 120Hz display.",
    price: 729.99,
    categories: [subcategories[0]._id],
    inventoryCount: 60,
    images: [
      "https://example.com/images/oneplus-9-1.jpg",
      "https://example.com/images/oneplus-9-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Products for Laptops
  {
    _id: new ObjectId(),
    name: "MacBook Air M1",
    description: "Apple's lightest and most portable laptop with M1 chip.",
    price: 999.99,
    categories: [subcategories[1]._id],
    inventoryCount: 50,
    images: [
      "https://example.com/images/macbook-air-m1-1.jpg",
      "https://example.com/images/macbook-air-m1-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Dell XPS 13",
    description: "Compact and powerful laptop with 11th Gen Intel Core.",
    price: 1199.99,
    categories: [subcategories[1]._id],
    inventoryCount: 40,
    images: [
      "https://example.com/images/dell-xps-13-1.jpg",
      "https://example.com/images/dell-xps-13-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "HP Spectre x360",
    description: "2-in-1 laptop with 360-degree hinge and OLED display.",
    price: 1299.99,
    categories: [subcategories[1]._id],
    inventoryCount: 30,
    images: [
      "https://example.com/images/hp-spectre-1.jpg",
      "https://example.com/images/hp-spectre-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Lenovo ThinkPad X1 Carbon",
    description: "Business-class laptop with ultra-light design.",
    price: 1399.99,
    categories: [subcategories[1]._id],
    inventoryCount: 20,
    images: [
      "https://example.com/images/thinkpad-x1-1.jpg",
      "https://example.com/images/thinkpad-x1-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Products for Refrigerators
  {
    _id: new ObjectId(),
    name: "LG Smart Refrigerator",
    description: "Smart refrigerator with Wi-Fi connectivity.",
    price: 1499.99,
    categories: [subcategories[2]._id],
    inventoryCount: 25,
    images: [
      "https://example.com/images/lg-fridge-1.jpg",
      "https://example.com/images/lg-fridge-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Samsung French Door Refrigerator",
    description: "Spacious refrigerator with French doors.",
    price: 1999.99,
    categories: [subcategories[2]._id],
    inventoryCount: 15,
    images: [
      "https://example.com/images/samsung-fridge-1.jpg",
      "https://example.com/images/samsung-fridge-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Whirlpool Double Door Refrigerator",
    description: "Efficient refrigerator with double door.",
    price: 1299.99,
    categories: [subcategories[2]._id],
    inventoryCount: 30,
    images: [
      "https://example.com/images/whirlpool-fridge-1.jpg",
      "https://example.com/images/whirlpool-fridge-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "GE Top-Freezer Refrigerator",
    description: "Affordable refrigerator with top freezer.",
    price: 899.99,
    categories: [subcategories[2]._id],
    inventoryCount: 40,
    images: [
      "https://example.com/images/ge-fridge-1.jpg",
      "https://example.com/images/ge-fridge-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Products for Men's Clothing
  {
    _id: new ObjectId(),
    name: "Men's Casual Shirt",
    description: "Comfortable and stylish casual shirt.",
    price: 29.99,
    categories: [subcategories[3]._id],
    inventoryCount: 100,
    images: [
      "https://example.com/images/mens-casual-shirt-1.jpg",
      "https://example.com/images/mens-casual-shirt-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Men's Formal Trousers",
    description: "Perfect trousers for formal occasions.",
    price: 49.99,
    categories: [subcategories[3]._id],
    inventoryCount: 80,
    images: [
      "https://example.com/images/mens-formal-trousers-1.jpg",
      "https://example.com/images/mens-formal-trousers-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Men's Leather Jacket",
    description: "Premium leather jacket for men.",
    price: 199.99,
    categories: [subcategories[3]._id],
    inventoryCount: 50,
    images: [
      "https://example.com/images/mens-leather-jacket-1.jpg",
      "https://example.com/images/mens-leather-jacket-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Men's Sports Shoes",
    description: "Comfortable and durable sports shoes.",
    price: 79.99,
    categories: [subcategories[3]._id],
    inventoryCount: 60,
    images: [
      "https://example.com/images/mens-sports-shoes-1.jpg",
      "https://example.com/images/mens-sports-shoes-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Products for Women's Clothing
  {
    _id: new ObjectId(),
    name: "Women's Summer Dress",
    description: "Light and airy summer dress.",
    price: 39.99,
    categories: [subcategories[4]._id],
    inventoryCount: 90,
    images: [
      "https://example.com/images/womens-summer-dress-1.jpg",
      "https://example.com/images/womens-summer-dress-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Women's Winter Coat",
    description: "Warm and stylish winter coat.",
    price: 149.99,
    categories: [subcategories[4]._id],
    inventoryCount: 40,
    images: [
      "https://example.com/images/womens-winter-coat-1.jpg",
      "https://example.com/images/womens-winter-coat-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Women's Handbag",
    description: "Elegant handbag for everyday use.",
    price: 89.99,
    categories: [subcategories[4]._id],
    inventoryCount: 70,
    images: [
      "https://example.com/images/womens-handbag-1.jpg",
      "https://example.com/images/womens-handbag-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Women's High Heels",
    description: "Chic high heels for special occasions.",
    price: 99.99,
    categories: [subcategories[4]._id],
    inventoryCount: 50,
    images: [
      "https://example.com/images/womens-high-heels-1.jpg",
      "https://example.com/images/womens-high-heels-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Products for Fiction Books
  {
    _id: new ObjectId(),
    name: "The Great Gatsby",
    description: "Classic novel by F. Scott Fitzgerald.",
    price: 14.99,
    categories: [subcategories[5]._id],
    inventoryCount: 120,
    images: [
      "https://example.com/images/great-gatsby-1.jpg",
      "https://example.com/images/great-gatsby-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "1984 by George Orwell",
    description: "Dystopian novel by George Orwell.",
    price: 19.99,
    categories: [subcategories[5]._id],
    inventoryCount: 100,
    images: [
      "https://example.com/images/1984-1.jpg",
      "https://example.com/images/1984-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "To Kill a Mockingbird",
    description: "Pulitzer Prize-winning novel by Harper Lee.",
    price: 18.99,
    categories: [subcategories[5]._id],
    inventoryCount: 90,
    images: [
      "https://example.com/images/to-kill-a-mockingbird-1.jpg",
      "https://example.com/images/to-kill-a-mockingbird-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "The Catcher in the Rye",
    description: "Novel by J.D. Salinger.",
    price: 17.99,
    categories: [subcategories[5]._id],
    inventoryCount: 110,
    images: [
      "https://example.com/images/catcher-in-the-rye-1.jpg",
      "https://example.com/images/catcher-in-the-rye-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Products for Non-Fiction Books
  {
    _id: new ObjectId(),
    name: "Sapiens: A Brief History of Humankind",
    description: "Book by Yuval Noah Harari.",
    price: 24.99,
    categories: [subcategories[6]._id],
    inventoryCount: 80,
    images: [
      "https://example.com/images/sapiens-1.jpg",
      "https://example.com/images/sapiens-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Educated: A Memoir",
    description: "Memoir by Tara Westover.",
    price: 22.99,
    categories: [subcategories[6]._id],
    inventoryCount: 70,
    images: [
      "https://example.com/images/educated-1.jpg",
      "https://example.com/images/educated-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Becoming by Michelle Obama",
    description: "Memoir by former First Lady Michelle Obama.",
    price: 29.99,
    categories: [subcategories[6]._id],
    inventoryCount: 60,
    images: [
      "https://example.com/images/becoming-1.jpg",
      "https://example.com/images/becoming-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "The Power of Habit",
    description: "Book on habit formation by Charles Duhigg.",
    price: 21.99,
    categories: [subcategories[6]._id],
    inventoryCount: 75,
    images: [
      "https://example.com/images/power-of-habit-1.jpg",
      "https://example.com/images/power-of-habit-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Products for Fitness Equipment
  {
    _id: new ObjectId(),
    name: "Treadmill",
    description: "High-quality treadmill for home use.",
    price: 599.99,
    categories: [subcategories[7]._id],
    inventoryCount: 30,
    images: [
      "https://example.com/images/treadmill-1.jpg",
      "https://example.com/images/treadmill-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Dumbbell Set",
    description: "Adjustable dumbbell set for strength training.",
    price: 149.99,
    categories: [subcategories[7]._id],
    inventoryCount: 60,
    images: [
      "https://example.com/images/dumbbells-1.jpg",
      "https://example.com/images/dumbbells-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Yoga Mat",
    description: "Non-slip yoga mat for all types of exercises.",
    price: 29.99,
    categories: [subcategories[7]._id],
    inventoryCount: 120,
    images: [
      "https://example.com/images/yoga-mat-1.jpg",
      "https://example.com/images/yoga-mat-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Exercise Bike",
    description: "Indoor cycling bike with adjustable resistance.",
    price: 399.99,
    categories: [subcategories[7]._id],
    inventoryCount: 25,
    images: [
      "https://example.com/images/exercise-bike-1.jpg",
      "https://example.com/images/exercise-bike-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Products for Outdoor Sports
  {
    _id: new ObjectId(),
    name: "Mountain Bike",
    description: "Durable mountain bike for rough terrains.",
    price: 499.99,
    categories: [subcategories[8]._id],
    inventoryCount: 35,
    images: [
      "https://example.com/images/mountain-bike-1.jpg",
      "https://example.com/images/mountain-bike-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Tent",
    description: "Spacious tent for camping trips.",
    price: 149.99,
    categories: [subcategories[8]._id],
    inventoryCount: 40,
    images: [
      "https://example.com/images/tent-1.jpg",
      "https://example.com/images/tent-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Hiking Boots",
    description: "Comfortable and durable hiking boots.",
    price: 89.99,
    categories: [subcategories[8]._id],
    inventoryCount: 50,
    images: [
      "https://example.com/images/hiking-boots-1.jpg",
      "https://example.com/images/hiking-boots-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Sleeping Bag",
    description: "Warm sleeping bag for outdoor camping.",
    price: 59.99,
    categories: [subcategories[8]._id],
    inventoryCount: 60,
    images: [
      "https://example.com/images/sleeping-bag-1.jpg",
      "https://example.com/images/sleeping-bag-2.jpg"
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Combine parent categories, subcategories, and products
const data = {
  categories: [...parentCategories, ...subcategories],
  products
};

// Save categories and products to JSON files
fs.writeFileSync(
  path.join(__dirname, "categories.json"),
  JSON.stringify(data.categories, null, 2),
  "utf-8"
);
fs.writeFileSync(
  path.join(__dirname, "products.json"),
  JSON.stringify(data.products, null, 2),
  "utf-8"
);

console.log(`${data.categories.length} categories (including subcategories) and ${data.products.length} products have been written to JSON files.`);
