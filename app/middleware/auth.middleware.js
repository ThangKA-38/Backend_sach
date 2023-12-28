const { log } = require('console');
const jwt = require('jsonwebtoken');
require('dotenv/config');

exports.authAdmin = (req, res, next) => {
    const authorizationHeader = req.get("Authorization");

    if (authorizationHeader === undefined) {
        return res.status(401).json({
            message: "You need to log in"
        });
    }

    const token = (req.get("Authorization")).split(" ")[1].trim();

    if (token === undefined) {
        return res.json({
            message: "Access Denied! Unauthorized User"
        });
    } else {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, authData) => {
            if (err) {
                res.json({
                    message: "Invalid Token..." + err.message
                });

            } else {
                const role_id = authData.role_id;
                if (role_id === 1) {
                    next();
                } else {
                    return res.status(401).json({
                        message: "You are not a Admin"
                    });
                }
            }
        })
    }
}
// xác thực người dùng
exports.authMember = (req, res, next) => {
    const authorizationHeader = req.get("Authorization");

    if (authorizationHeader === undefined) {
        return res.status(401).json({
            message: "You need to log in"
        });
    }

    const token = authorizationHeader.split(" ")[1].trim();

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, authData) => {
        if (err != null) {
            console.error('Token Verification Error:', err);
            res.status(401).json({
                message: "Invalid Token..." + err.message
            });
        } else {
            const role_id = authData.role_id;
            if (role_id === 2 || role_id === 1) {
                next();
            } else {
                return res.status(401).json({
                    message: "You are not authorized"
                });
            }
        }
    });
};

// Function to create middleware for login authentication
const authenticateLogin = (account_id) => {
    return (req, res, next) => {
        const { username, password } = req.body; // Assuming you have username and password in the request body

        // Add your logic to authenticate the user (e.g., check credentials against a database)
        // For demonstration purposes, let's assume a simple check here
        if (account_id === 1) {
            req.role_id = 1; // Set role_id for the token
            next();
        } else if (account_id === 2) {
            req.role_id = 2; // Set role_id for the token
            next();
        } else {
            res.status(401).json({
                message: "Invalid credentials or account type"
            });
        }
    };
};

// Usage example for admin login
exports.adminLogin = authenticateLogin(1);

// Usage example for member login
exports.memberLogin = authenticateLogin(2);