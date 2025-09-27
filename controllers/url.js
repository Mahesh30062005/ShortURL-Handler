const {nanoid} = require('nanoid');
const URL = require('../models/user');
async function handleGenerateNewShortUrl(req,res) {
    const body = req.body;  
    if(!body || !body.url){

     return res.status(400).json({error: "this is bad request !!"})
    }
        const shortID = nanoid(9);
        const rawUrl = req.body.url.trim();
        const normalizedUrl = /^(https?:)\/\//i.test(rawUrl) ? rawUrl : `http://${rawUrl}`;
        await URL.create({
            shortId:shortID,
            redirectURL : normalizedUrl,
            visitHistory: [],
            createdBy : req.AuthUser._id
        });

        return res.json({id: shortID})
}

async function handleGenerateNewShortUrlForm(req,res){
    console.log("URL generation attempt - AuthUser:", req.AuthUser);
    console.log("Request body:", req.body);
    
    const body = req.body;  
    if(!body || !body.url){
        // Fetch all URLs even for error case
            try {
                const url = await URL.find({ createdBy: req.AuthUser._id }).sort({ createdAt: -1 });
                return res.render("home", { 
                    url, 
                    error: "Please enter a valid URL",
                    user: req.AuthUser 
                });
            } catch(err) {
                return res.render("home", { 
                    error: "Please enter a valid URL",
                    user: req.AuthUser 
                });
            }
    }
    
    try {
        const shortID = nanoid(9);
        const rawUrl = req.body.url.trim();
        const normalizedUrl = /^(https?:)\/\//i.test(rawUrl) ? rawUrl : `http://${rawUrl}`;
        await URL.create({
            shortId: shortID,
            redirectURL: normalizedUrl,
            visitHistory: [],
            createdBy: req.AuthUser ? req.AuthUser._id : undefined,
        });

        // Fetch only URLs created by the logged-in user
        const url = await URL.find({ createdBy: req.AuthUser._id }).sort({ createdAt: -1 });
        return res.render("home", { 
            id: shortID, 
            url,
            user: req.AuthUser 
        });
    } catch (err) {
        console.error("Error creating short URL:", err);
        // Fetch only URLs created by the logged-in user even for error case
        try {
            const url = await URL.find({ createdBy: req.AuthUser._id }).sort({ createdAt: -1 });
            return res.render("home", { 
                url, 
                error: "Error creating short URL. Please try again.",
                user: req.AuthUser 
            });
        } catch (fetchErr) {
            return res.render("home", { 
                error: "Error creating short URL. Please try again.",
                user: req.AuthUser 
            });
        }
    }
}

async function handleAnyliticsShortId(req,res){
    const shortId = req.params.shortId;
    const result = await URL.findOne({shortId});
    if (!result) {
        return res.status(404).json({ error: "Short URL not found" });
    }
    return res.json({totalClicks : result.visitHistory.length ,
        analytics : result.visitHistory
    });
}

module.exports = {
    handleGenerateNewShortUrl,
    handleGenerateNewShortUrlForm,
    handleAnyliticsShortId,
}