const express = require('express');
const router = express.Router();
const { handleGenerateNewShortUrl, handleGenerateNewShortUrlForm, handleAnyliticsShortId } = require("../controllers/url");

router.post("/",handleGenerateNewShortUrlForm);
router.get("/:shortId", handleAnyliticsShortId);
module.exports = router;