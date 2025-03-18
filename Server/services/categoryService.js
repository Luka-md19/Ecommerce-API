const Category = require('../models/categoryModel');

// Function to find a category by ID and populate its subcategories and products
exports.findCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId)
    .populate({
      path: 'subcategories',
      populate: {
        path: 'products',
        select: 'name price images',
      },
    });

  return category;
};


// Function to find categories with subcategories and return a cleaned-up structure
exports.findCategoriesWithSubcategories = async () => {
  // Fetch all categories that don't have a parent (top-level categories)
  const categories = await Category.find({ parentCategoryId: null })
    .populate({
      path: 'subcategories',
      select: 'name _id' // We only need the name and id of subcategories
    });

  // Transform the categories into the expected format for the client
  const simplifiedCategories = categories.map(category => ({
    id: category._id.toString(),  // Renamed _id to id and converted to string
    name: category.name,
    description: category.description,
    subcategories: category.subcategories.map(subcategory => ({
      id: subcategory._id.toString(),  // Renamed _id to id and converted to string
      name: subcategory.name
    }))
  }));

  return simplifiedCategories;
};
// Transform category response and include SEO metadata
exports.transformCategoryResponseWithMeta = (category) => {
  const transformedCategory = {
    id: category._id,  // Renamed _id to id
    name: category.name,
    description: category.description,
    subcategories: category.subcategories.map((subcategory) => ({
      id: subcategory._id,  // Renamed _id to id
      name: subcategory.name,
      description: subcategory.description,
      products: subcategory.products.map((product) => ({
        id: product._id,  // Renamed _id to id
        name: product.name,
        price: product.price,
        image: product.images[0], // First image as an example
      })),
    })),
  };

  const seoMeta = {
    seoTitle: `Explore ${category.name} - Top Products in ${category.name}`,
    seoDescription: `${category.name} category includes the best products at unbeatable prices.`,
    canonicalUrl: `http://localhost:3000/categories/${category._id}`,
  };

  return { category: transformedCategory, metadata: seoMeta };
};
