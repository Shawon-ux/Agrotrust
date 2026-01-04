// backend/middleware/requireVerifiedUser.js
const requireVerifiedUser = (req, res, next) => {
    if (req.user && req.user.isVerified) {
        return next();
    }
    return res.status(403).json({ message: "Email verification required" });
};

module.exports = requireVerifiedUser;
