module.exports = app => {
    var router = require('express').Router();
    const controller = require('../controllers/Book_controler')
    const middleware = require('../middleware/auth.middleware');
    const upload = require('../upload.muler')
    const commentController = require('../controllers/Comment_controller');

    router.get('/', (req, res) => {
        res.render('introduction.ejs')
    })

    router.get('/home', (req, res) => {
        res.render('home.ejs')
    })

    router.get('/form_add_book', controller.ShowBook)
        .post('/add_book', upload.fields([{ name: 'fileElem' }, { name: 'myImage' }]), controller.createNewBook)

    router.get('/book', controller.ShowBook)
        .get('/detail_book/:id', controller.detailBook)
        .delete('/remove_book/:id', middleware.authAdmin, controller.removeBook)
        .get('/category/:id', controller.categoryBook)
        .get('/all_category', controller.All_CataCategory)
        .get('/all_supplier', controller.All_supplier)
        .get('/search', controller.searchProduct);
        
        const path = require('path');

        router.post('/comments/:id', commentController.addComment);

        // Get comments for a specific book
        router.get('/comments/book/:id', commentController.getCommentsByBookId);
        
        // Update a comment
        router.put('/comments/:id', commentController.updateComment);
        
        // Delete a comment
        router.delete('/comments/:id', commentController.deleteComment);


        router.get('/pdf-file/:id', controller.Cut_File_PDF);

        
    app.use(router);
}