const express = require('express');
const router = express.Router();
const { handleGenerateNewShortUrl, handleGenerateNewShortUrlForm, handleAnyliticsShortId } = require("../controllers/url");

router.post("/",handleGenerateNewShortUrlForm);
router.get("/:shortId", handleAnyliticsShortId);
module.exports = router;

/**
 * @swagger
 * /url:
 * post:
 * summary: Create a new short URL
 * tags: [URLs]
 * security:
 * - cookieAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * url:
 * type: string
 * description: The original long URL to shorten
 * responses:
 * 201:
 * description: Short URL created successfully
 * 400:
 * description: URL is required
 * 401:
 * description: Unauthorized
 */