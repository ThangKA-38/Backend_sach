module.exports = app => {
    require('./book.router')(app);

    require('./auth.router')(app);

    require('./member.router')(app);

    require('./admin.router')(app);

    require('./vnpay.router')(app);
}