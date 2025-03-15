const express = require("express");
const router = express.Router();
const { getReviews, addReview ,getSearchReviews} = require("../controllers/reviewController");

router.get("/search", getSearchReviews);
router.get("/:companyId", getReviews); // Get reviews for a company
router.post("/", addReview); // Add a new review
module.exports = router;
