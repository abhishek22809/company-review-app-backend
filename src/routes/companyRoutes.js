const express = require("express");
const upload = require("../middleware/upload");

const router = express.Router();
const { addCompany,getAllCompanies,getCompaniesByCity,getCompanyById } = require("../controllers/companyController");

router.get("/", getAllCompanies);
router.post("/", upload.single("logo"), addCompany);
router.get("/by-city", getCompaniesByCity);
router.get("/:id", getCompanyById);



module.exports = router;
