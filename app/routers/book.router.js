module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/Book_controler')
    const middleware = require('../middleware/auth.middleware');
    const commentController = require('../controllers/comment.controller')

    router.get('/', (req, res) => {
        res.render('introduction.ejs')
    })

    router.get('/home', (req, res) => {
        res.render('home.ejs')
    })

    router.get('/book', controller.ShowBook_full)
        .get('/book_5page', controller.ShowBook_5page)
        .get('/book/detail/:id', controller.detailBooK)
        .get('/category/:id', controller.categoryBook)
        .get('/all_category', controller.All_CataCategory)
        .get('/all_supplier', controller.All_supplier)
        .post('/add_cart/:id', controller.Add_Cart)
        //   .get('./show_cart', controller.show_Cart)

    router.post('/comments/:id', commentController.addComment)
        .get('/comments/book/:id', commentController.getCommentsByBookId)
        // Update a comment
        .put('/comments/:id', commentController.updateComment)
        // Delete a comment
        .delete('/comments/:id', commentController.deleteComment)
    app.use(router);
}