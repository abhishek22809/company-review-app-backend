const Company = require("../models/Company");
const Review = require("../models/Review");
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

// 1️⃣ **Get Companies by City or Name**
exports.getCompaniesByCity = async (req, res) => {
  try {
    const {
      city,
      name
    } = req.query;

    // ✅ Build dynamic search query
    const query = {};
    if (city || name) {
      query.$or = [];
      if (city) query.$or.push({
        location: new RegExp(city, "i")
      });
      if (name) query.$or.push({
        name: new RegExp(name, "i")
      });
    }

    // ✅ Fetch companies with review ratings
    const companies = await Company.find(query).populate("reviews", "rating").lean();
    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

// 2️⃣ **Get All Companies**
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate("reviews", "rating").sort({
      _id: -1
    }).lean();
    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching all companies:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

// 3️⃣ **Get Company by ID**
exports.getCompanyById = async (req, res) => {
  const {
    id
  } = req.params;
  const validationError = validateObjectId(id, res);
  if (validationError) return;
  try {
    const company = await Company.findById(id).populate("reviews", "rating").sort({
      _id: -1
    }).lean();
    if (!company) return res.status(404).json({
      error: "Company not found"
    });
    res.status(200).json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

// 4️⃣ **Add a New Company**
exports.addCompany = async (req, res) => {
  try {
    const {
      name,
      location,
      foundedOn
    } = req.body;
    const logo = req.file ? req.file.filename : "";
    if (!name || !location) return res.status(400).json({
      error: "Name and location are required"
    });
    const company = new Company({
      name,
      location,
      foundedOn: foundedOn ? new Date(foundedOn) : null,
      logo
    });
    await company.save();
    res.status(201).json({
      message: "Company added successfully",
      company
    });
  } catch (error) {
    console.error("Error adding company:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

// 5️⃣ **Get Reviews for a Company**
exports.getCompanyReviews = async (req, res) => {
  const {
    companyId
  } = req.params;
  const validationError = validateObjectId(companyId, res);
  if (validationError) return;
  try {
    // ✅ Fetch company along with reviews directly
    const company = await Company.findById(companyId).populate("reviews").lean();
    if (!company) return res.status(404).json({
      error: "Company not found"
    });
    res.status(200).json(company.reviews);
  } catch (error) {
    console.error("Error fetching company reviews:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};