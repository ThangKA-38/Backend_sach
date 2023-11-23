const sql = require('./db');
const Comment = function(comment) {
    this.book_id = comment.book_id;
    this.account_id = comment.account_id;
    this.name_user = comment.name_user;
    this.comments = comment.comments; // Ensure this line is correct
    this.created_at = new Date();
    this.updated_at = new Date();
};

Comment.addComment = (newComment, result) => {
    console.log(newComment);
    sql.query('INSERT INTO comment_rating SET ?', newComment, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            // Fetch the inserted comment by its ID
            sql.query('SELECT * FROM comment_rating WHERE id = ?', res.insertId, (err, comment) => {
                if (err) {
                    result(err, null);
                } else {
                    result(null, comment[0]); // Assuming the ID is unique, so we return the first (and only) element
                }
            });
        }
    });
};
Comment.getCommentsByBookId = (bookId, result) => {
    const db = 'SELECT * FROM comment_rating WHERE book_id = ?';
    sql.query(db, [bookId], (err, comments) => {
        if (err) {
            result(err, null);
        } else {
            result(null, comments);
        }
    });
};

// Add other comment-related functions as needed