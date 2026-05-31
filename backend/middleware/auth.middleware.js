import jwt from "jsonwebtoken"

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {             //are bhai token hona to chaaiye
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
};

const isCompanyVerified = (req, res, next) => {
    if (req.user && req.user.role === 'company' && req.user.verificationStatus === 'pending') {
        return res.status(403).json({ message: 'Forbidden: Company is not verified yet' });
    }
    next();
};

const checkAdminRole = (adminTypes) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== 'admin' || !adminTypes.includes(req.user.adminType)) {
            if (req.user && req.user.role === 'admin' && req.user.adminType === 'super_admin') {
                return next(); // super_admin has all access
            }
            return res.status(403).json({ message: 'Forbidden: Insufficient admin privileges' });
        }
        next();
    };
};

export {
    verifyToken,
    checkAdminRole,
    isCompanyVerified,
    requireRole
}