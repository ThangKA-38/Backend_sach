module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/Book_controler')
    const middleware = require('../middleware/auth.middleware');
    const commentController = require('../controllers/comment.controller')

    router.get('/book', controller.ShowBook_full)
        .get('/book/detail/:id', controller.detailBooK)
        .get('/category/:id', controller.categoryBookByID)
        .get('/all_category', controller.All_CataCategory)
        .get('/all_supplier', controller.All_supplier)

    router.post('/comments/:id', commentController.addComment)
        .get('/comments/book/:id', commentController.getCommentsByBookId)
        .put('/comments/:id', commentController.updateComment)
        .delete('/comments/:id', commentController.deleteComment)

    router.get('/cut_pdf-file/:book_id', controller.check_payment_pdf)
    //.get('/pdf/full/:book_id', controller.check_payment_pdf)
    //.get('/pdf/full/:book_id', controller.ShowBook_full)
    app.use(router);
}