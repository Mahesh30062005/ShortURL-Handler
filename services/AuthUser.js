const jwt = require('jsonwebtoken');
const secret = "Mahesh@2005#Bhakt";
//const sessionIdToUserIdMap = new Map();

// function setUser (id, authUser){
//     return sessionIdToUserIdMap.set(id, authUser);
// };

function setUser(authUser) {
    return jwt.sign({
        _id: authUser._id,
        email: authUser.email,
        role: authUser.role,
    }, secret);
}


function getUser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
}

module.exports = {
    setUser,
    getUser
};