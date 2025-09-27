const mongoose = require('mongoose');

async function connectMongoDB(url) {
    console.log("Connecting to MongoDB:", url);
    
    // Disconnect any existing connections first
    if (mongoose.connection.readyState !== 0) {
        console.log("Disconnecting existing connection...");
        await mongoose.disconnect();
    }
    
    const result = await mongoose.connect(url);
    console.log("MongoDB connected successfully!");
    console.log("Database name:", mongoose.connection.db.databaseName);
    return result;
}

module.exports = {
    connectMongoDB,
}