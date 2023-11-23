const { json } = require('body-parser');
const mysql = require('../models/db')

module.exports = app => {
    const router = require('express').Router();
    const mysql = require('../models/db')
    // Ngân hàng	NCB
    // Số thẻ	9704198526191432198
    // Tên chủ thẻ	NGUYEN VAN A
    // Ngày phát hành	07/15
    // Mật khẩu OTP	123456
    router.post('/create_payment_url', function (req, res, next) {
        try {
            // var ipAddr = req.headers['x-forwarded-for'] ||
            //     req.connection.remoteAddress ||
            //     req.socket.remoteAddress ||
            //     req.connection.socket.remoteAddress;
            var ipAddr = '127.0.0.1'

            import('dateformat').then((module) => {
                var dateFormat = module.default;

                var tmnCode = 'ZO95RYHZ';
                var secretKey = 'AZPFCSSYQJACOJDYZKTUFSXKAPMWPUQQ';
                var vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
                var returnUrl = 'http://localhost:3031/payment_success';

                var date = new Date();
                var createDate = dateFormat(date, 'yyyymmddHHMMss');
                var orderId = dateFormat(date, 'HHmmss');
                var amount = req.body.amount;
                var orderInfo = req.body.orderDescription;
                var orderType = req.body.orderType;
                var locale = req.body.language;
                // var amount = 11000
                // var orderInfo = 'thanh toan vnpay nodejs';
                // var orderType = 'payment';
                var locale = req.body.language;
                if (!locale) {
                    locale = 'vn';
                }
                var currCode = 'VND';

                let vnp_Params = {};
                vnp_Params['vnp_Version'] = '2.1.0';
                vnp_Params['vnp_Command'] = 'pay';
                vnp_Params['vnp_TmnCode'] = tmnCode;
                vnp_Params['vnp_Locale'] = locale;
                vnp_Params['vnp_CurrCode'] = currCode;
                vnp_Params['vnp_TxnRef'] = orderId;
                vnp_Params['vnp_OrderInfo'] = orderInfo;
                vnp_Params['vnp_OrderType'] = orderType;
                vnp_Params['vnp_Amount'] = amount * 100;
                vnp_Params['vnp_ReturnUrl'] = returnUrl;
                vnp_Params['vnp_IpAddr'] = ipAddr;
                vnp_Params['vnp_CreateDate'] = createDate;


                vnp_Params = sortObject(vnp_Params);

                var querystring = require('qs');
                var signData = querystring.stringify(vnp_Params, { encode: false });
                var crypto = require("crypto");
                var hmac = crypto.createHmac("sha512", secretKey);
                var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
                vnp_Params['vnp_SecureHash'] = signed;
                vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
                res.redirect(vnpUrl)
            })
        } catch (error) {
            console.error('An error occurred:', error);
            // Handle the error appropriately, such as sending an error response to the client
            res.status(500).json({ error: 'An error occurred during payment initiation' });
        }
    });

    function sortObject(obj) {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }


    app.get('/vnpay', (req, res) => {
        res.render('VN_Pay/form_info')
    })

    app.get('/payment_success', (req, res) => {

        var vnp_Params = req.query;
        var secureHash = vnp_Params['vnp_SecureHash'];
        var secretKey = 'AZPFCSSYQJACOJDYZKTUFSXKAPMWPUQQ';

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");


        if (secureHash === signed) {

            const db = `INSERT INTO receipt SET ?`
            mysql.query(db, vnp_Params, (err) => {
                if (err) {
                    console.log('ERR:', err);
                } else {
                    console.log('Insert successful!');
                }
            })
            //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi

            if (vnp_Params['vnp_ResponseCode'] == 00) {
                res.status(200).json({ vnp_Params, Message: 'Payment success' })
            } else if (vnp_Params['vnp_ResponseCode'] == 24) {
                res.status(200).json({ Message: 'Payment cancel', vnp_Params })
            } else {
                res.status(200).json({ Message: 'Payment failed' })
            }

        } else {
            res.status(200).json({ RspCode: '97', Message: 'Fail checksum' })
        }
    })

    app.use(router)
}