const express = require('express');
const router = express.Router();
const {handleAuthUserSignup, handleAuthUserLogin, } = require('../controllers/Authuser');

router.post('/', handleAuthUserSignup);
router.post('/login', handleAuthUserLogin);

module.exports = router;