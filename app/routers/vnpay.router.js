
module.exports = app => {
    const router = require('express').Router();
    const sql = require('../models/db')
    const model_book = require('../models/Book_model')
    const jwtDecode = require("jwt-decode");
    const middleware = require('../middleware/auth.middleware')
    // Ngân hàng	NCB
    // Số thẻ	9704198526191432198
    // Tên chủ thẻ	NGUYEN VAN A
    // Ngày phát hành	07/15
    // Mật khẩu OTP	123456

    router.post('/create_payment_url/:id', middleware.authMember, function (req, res, next) {
        try {
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
                var locale = 'vn';
                var currCode = 'VND';
                var bankCode = 'NCB';
                var book_id = req.params.id;
                let orderInfo
                let amount
                model_book.findByID(book_id, (err, data) => {
                    orderInfo = data[0].book_id
                    amount = data[0].price

                    // var amount = 10000;
                    // var orderInfo = 'conan';
                    // var orderType = 3;

                    let vnp_Params = {};
                    vnp_Params['vnp_Version'] = '2.1.0';
                    vnp_Params['vnp_Command'] = 'pay';
                    vnp_Params['vnp_TmnCode'] = tmnCode;
                    vnp_Params['vnp_Locale'] = locale;
                    vnp_Params['vnp_CurrCode'] = currCode;
                    vnp_Params['vnp_TxnRef'] = orderId;
                    vnp_Params['vnp_OrderInfo'] = orderInfo;
                    vnp_Params['vnp_OrderType'] = book_id;
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
                    res.json({ vnpUrl })
                })
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

    app.get('/payment_success', middleware.authMember, (req, res) => {
        const token = (req.get("Authorization")).split(" ")[1].trim();
        const account_id = jwtDecode.jwtDecode(token, { header: false }).account_id;

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

        var data = {
            "vnp_Amount": vnp_Params['vnp_Amount'],
            "vnp_BankCode": vnp_Params['vnp_BankCode'],
            "vnp_BankCode": vnp_Params['vnp_BankCode'],
            "book_id": vnp_Params['vnp_OrderInfo'],
            "vnp_PayDate": vnp_Params['vnp_PayDate'],
            "vnp_ResponseCode": vnp_Params['vnp_ResponseCode'],
            "vnp_TmnCode": vnp_Params['vnp_TmnCode'],
            "vnp_TransactionNo": vnp_Params['vnp_TransactionNo'],
            "vnp_TransactionStatus": vnp_Params['vnp_TransactionStatus'],
            "vnp_TxnRef": vnp_Params['vnp_TxnRef'],
            "account_id": account_id
        }
        if (secureHash === signed) {
            const db = `INSERT INTO receipt SET ?`
            sql.query(db, data, (err) => {
                if (err) {
                    console.log('ERR:', err);
                } else {
                    console.log('Insert successful!');
                }
            })
            //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi

            const db_2 = `SELECT * FROM receipt WHERE account_id = ${account_id}`
            sql.query(db_2, data, (err) => {
                if (vnp_Params['vnp_ResponseCode'] == 0) {
                    res.status(200).json({
                        data, Message: 'Payment success',
                        return_full_page: `http://localhost:3031/pdf/full/${vnp_Params['vnp_OrderInfo']}`
                    })
                } else if (vnp_Params['vnp_ResponseCode'] == 24) {
                    res.status(200).json({ Message: 'Payment cancel', data })
                }
            })
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Fail checksum' })
        }
    })

    app.use(router)
}