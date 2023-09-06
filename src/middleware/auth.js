const jwt = require('jsonwebtoken');
const User = require('../models/registrations');

const auth = async (req, res, next) => {
    try {
        const userToken = req.cookies.jwt_login;
        const verifyUser = jwt.verify(userToken, process.env.JWT_SECRET);
        req.token = userToken;
        req.user = await User.findOne({_id: verifyUser._id});
        next();
    } catch (error) {
        res.status(404).send(error);
    }
}

module.exports = auth;