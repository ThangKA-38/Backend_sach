const { log } = require('console');
const jwt = require('jsonwebtoken');
require('dotenv/config');

exports.authAdmin = (req, res, next) => {

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

    //    const token = req.headers['authorization'];
    const token = (req.get("Authorization")).split(" ")[1].trim();
    console.log(token);

    if (token === undefined) {
        return res.json({
            message: "Access Denied! Unauthorized User"
        });
    } else {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, authData) => {
            console.log(err == null)
            if (err != null) {
                console.error('Token Verification Error:', err);
                console.log(token);
                res.json({
                    message: "Invalid Token..." + err.message
                });
            } else {
                const role_id = authData.role_id;
                if (role_id === 2 || role_id === 1) {
                    next();
                } else {
                    return res.status(401).json({
                        message: "You need login"
                    });
                }
            }
        })
    }
}