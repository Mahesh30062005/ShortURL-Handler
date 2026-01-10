// 1. Imports
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// 2. Local Imports
const { connectMongoDB } = require('./connect');
const URL = require('./models/user'); 
const { checkForAuthentication, restrictTo, checkAuth } = require('./middleware/AuthUser');

const AuthuserRoute = require('./routes/Authuser');
const urlroute = require("./routes/url");
const staticRoutes = require('./routes/staticRoutes');

// 3. Configurations & App Initialization
const app = express();
const PORT = process.env.PORT || 8001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/short-url';

// 4. Swagger Configuration (Connection between cookieAuth and apis)
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ShortURL Handler API',
            version: '1.0.0',
            description: 'A production-grade URL shortening service API',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Local development server',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token' // This is the cookie name your middleware checks
                }
            }
        }
    },
    apis: ['./routes/*.js', './index.js'], // Scans both route files and this file
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5. Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 6. Routes
app.use("/authuser", AuthuserRoute);
app.use("/url", checkForAuthentication, restrictTo(["Normal"]), urlroute);
app.use("/", checkAuth, staticRoutes);

// Fix browser favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

/**
 * @swagger
 * /{shortId}:
 * get:
 * summary: Redirect to the original long URL
 * description: Takes a short ID and redirects to the original URL while logging the visit.
 * tags: [Redirection]
 * parameters:
 * - in: path
 * name: shortId
 * required: true
 * schema:
 * type: string
 * description: The unique short identifier
 * responses:
 * 302:
 * description: Redirecting to the original URL
 * 404:
 * description: Short URL not found
 * 500:
 * description: Internal server error
 */
app.get("/:shortId", async (req, res) => {
    try {
        const shortId = req.params.shortId;
        const entry = await URL.findOneAndUpdate(
            { shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now(),
                    },
                },
            },
            { new: true }
        );

        if (!entry) {
            return res.status(404).json({ error: "Short URL not found" });
        }
        res.redirect(entry.redirectURL);
    } catch (err) {
        console.error("Error in redirection:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

//7. Error Handling Middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

// 8. Server Start Logic
async function startServer() {
    try {
        await connectMongoDB(MONGO_URL);
        console.log(" MongoDB is connected successfully!");
        
        app.listen(PORT, () => {
            console.log(` Server is started at Port: ${PORT}`);
            console.log(` Documentation available at: http://localhost:${PORT}/api-docs`);
        });
    } catch (err) {
        console.error(" MongoDB connection error:", err);
        process.exit(1);
    }
}

startServer();