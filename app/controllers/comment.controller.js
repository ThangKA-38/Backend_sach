const Comment = require('../models/comment.model')

// Add a new comment
exports.addComment = (req, res) => {
    console.log(req.body); // Log the request body to see if data is received

    const newComment = {
        id_comment: req.body.id_comment,
        book_id: req.body.book_id,
        account_id: req.body.account_id,
        name_user: req.body.name_user, // Make sure to use the correct field name
        comments: req.body.comment,
    };

    Comment.addComment(newComment, (error, result) => {
        if (error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(201).json({ comment: result });
        }
    });
};

// Get comments for a specific book
exports.getCommentsByBookId = (req, res) => {
    const bookId = req.params.id;

    Comment.getCommentsByBookId(bookId, (error, comments) => {
        if (error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(200).json({ comments });
        }
    });
};

// Update a comment
exports.updateComment = (req, res) => {
    const commentId = req.params.id;
    const updatedComment = {
        name_user: req.body.name_user,
        comment: req.body.comment,
    };

    Comment.updateComment(commentId, updatedComment, (error, result) => {
        if (error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(200).json({ message: 'Comment updated successfully' });
        }
    });
};

// Delete a comment
exports.deleteComment = (req, res) => {
    const commentId = req.params.id;

    Comment.deleteComment(commentId, (error) => {
        if (error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(200).json({ message: 'Comment deleted successfully' });
        }
    });
};