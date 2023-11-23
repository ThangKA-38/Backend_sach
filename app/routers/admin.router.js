module.exports = (app) => {
    const express = require('express');
    const router = express.Router();
    const AuthController = require('../controllers/auth/auth.controller');
    const middleware = require('../middleware/auth.middleware')
    const upload = require('../upload.muler')
    const controller = require('../controllers/Book_controler')
    const controller_user = require('../controllers/member/member.controller')
    //manager account
    router.get('/listAccount', middleware.authAdmin, AuthController.list_account)
        .delete('/member/delete', middleware.authMember, controller_user.delete_infor_User);
    //manager book
    router.get('/form_add_book', controller.showDataNewBook)
        .post('/add_book', upload.fields([{ name: 'fileElem' }, { name: 'myImage' }]), controller.createNewBook)
        .delete('/book/remove/:id', middleware.authAdmin, controller.removeBook);


    app.use('/', router);
};