const Review = require("../models/Review");
const Company = require("../models/Company");
const mongoose = require("mongoose");

// ✅ Helper function to validate ObjectId
const validateObjectId = (id, res) => {
  if (!id) return res.status(400).json({
    error: "Company ID is required"
  });
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({
    error: "Invalid Company ID format"
  });
  return null;
};

// 1️⃣ **Get Reviews for a Company**
exports.getReviews = async (req, res) => {
  const {
    companyId
  } = req.params;
  const validationError = validateObjectId(companyId, res);
  if (validationError) return;
  try {
    const reviews = await Review.find({
      companyId
    }).lean();
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

// 2️⃣ **Add a Review**
exports.addReview = async (req, res) => {
  const {
    companyId,
    name,
    subject,
    reviewText,
    rating
  } = req.body;
  const validationError = validateObjectId(companyId, res);
  if (validationError) return;
  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({
      error: "Company not found"
    });

    // ✅ Create and save the review
    const review = await Review.create({
      companyId,
      reviewerName: name,
      subject,
      reviewText,
      rating
    });

    // ✅ Update company's reviews array
    await Company.findByIdAndUpdate(companyId, {
      $push: {
        reviews: review._id
      }
    });
    res.status(201).json({
      message: "Review added successfully",
      review
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

// 3️⃣ **Search Reviews**
exports.getSearchReviews = async (req, res) => {
  const {
    companyId,
    query
  } = req.query;
  const validationError = validateObjectId(companyId, res);
  if (validationError) return;
  try {
    // ✅ Construct dynamic search conditions
    const searchConditions = [{
      reviewerName: {
        $regex: query,
        $options: "i"
      }
    }, {
      subject: {
        $regex: query,
        $options: "i"
      }
    }, {
      reviewText: {
        $regex: query,
        $options: "i"
      }
    }];

    // ✅ Add rating filter only if query is a valid number
    if (!isNaN(query) && query.trim() !== "") {
      searchConditions.push({
        rating: Number(query)
      });
    }

    // ✅ Fetch reviews with optimized query
    const reviews = await Review.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      $or: searchConditions
    }).lean();
    res.json(reviews);
  } catch (error) {
    console.error("Error searching reviews:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};