const { getUser } = require('../services/AuthUser');

function checkForAuthentication (req,res,next ) {
    const tokenCookie= req.cookies?.token;
    
    if(!tokenCookie){
        req.AuthUser = null;
        return next();
    }

    const token = tokenCookie;
    const AuthUser = getUser(token);
    req.AuthUser = AuthUser;
    return next();
}

function restrictTo(role =[]){
    return function(req,res,next){
        console.log("restrictTo middleware - AuthUser:", req.AuthUser);
        console.log("restrictTo middleware - required roles:", role);
        
        if(!req.AuthUser ){
            console.log("No AuthUser found, redirecting to login");
            return res.redirect('/login');
        }
        if(!role.includes(req.AuthUser.role)){
            console.log("User role not authorized:", req.AuthUser.role);
            return res.status(403).json({error: "UnAuthorized Access"});
        }
        console.log("User authorized, proceeding");
        return next();
    }
}

const restrictToLoggedInUser = (req, res, next) => {
    const { uid } = req.cookies;
    if (!uid) {
        return res.redirect('/login');
    }
    
    const AuthUser = getUser(uid);
    if(!AuthUser || !AuthUser._id){
        return res.redirect('/login');
    }
    req.AuthUser = AuthUser;
    next();
};

async function checkAuth (req,res,next){
    const tokenCookie = req.cookies?.token;
    
    if(!tokenCookie){
        req.AuthUser = null;
        return next();
    }
    
    const AuthUser = getUser(tokenCookie);
    req.AuthUser = AuthUser;
    next();
};


module.exports = { restrictToLoggedInUser, checkAuth 
    , checkForAuthentication, restrictTo
};