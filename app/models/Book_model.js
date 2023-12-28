const sql = require('./db');

const Book = (book) => {
    this.book_title = book.book_title
    this.author = book.author
    this.publication_year = book.publication_year
    this.price = book.price
    this.supplier_id = -book.supplier_id
    this.category_id = book.category_id
}
Book.getBook_fullPage = (id, result) => {
    const db = `
    SELECT  book.book_id,book.book_title,book.price, i.file_path,i.image_path
    from book 
    LEFT JOIN book_img_file i
    ON book.book_id = i.book_id
    GROUP BY  book.book_id,book.book_title,book.price, i.file_path,i.image_path
    HAVING book.book_id = ${id}
    `
    sql.query(db, (err, book) => {
        if (err) {
            result(err, null)
        } else {
            result(book)
        }
    })
}

//lấy tất cả sách trong db ra 
Book.getAllBook_infor = (result) => {
    const db = `
        SELECT  
        book.book_id,
        book.book_title
        ,book.price,
         book_img_file.image_path,
         book_img_file.file_image_id,
         book_category.category_name,
         book_category.category_id,
         s.supplier_name,
         s.supplier_id
        FROM book 
        LEFT JOIN book_img_file  
        ON book.book_id = book_img_file.book_id
        LEFT JOIN book_category
        ON book.category_id = book_category.category_id
        LEFT JOIN book_supplier s ON s.supplier_id = book.supplier_id
        GROUP BY 
        book.book_id,book.book_title,book.price, 
        book_img_file.image_path,
        book_category.category_name,book_category.category_id,
        s.supplier_name,s.supplier_id
    `
    sql.query(db, (err, book) => {
        if (err) {
            result(err, null)
        } else {
            result(book)
        }
    })
}
//Lấy chi tiết từng sách 
///cầ sửa

Book.findByID = (id, result) => {
    const db = `
    SELECT * from book
    LEFT JOIN book_img_file 
    ON book.book_id = book_img_file.book_id
    LEFT JOIN book_supplier 
    ON book.supplier_id = book_supplier.supplier_id
    LEFT JOIN book_category 
    ON book.category_id = book_category.category_id
    WHERE book.book_id = ${id}
`;
    sql.query(db, (err, book) => {
        if (err) {
            result(err, null)
        } else {
            result(null, book)
        }
    })
}



// tìm kiếm sách bằng tên
Book.findByNameBook = (data, result) => {
    sql.query(`SELECT * FROM book WHERE book_title=${data}`, (err, book) => {
        if (err) {
            result(err, null)
        } else {
            result(book)
        }

    })
}

//thêm sách 
Book.addBook = (newData, result) => {
    sql.query('INSERT INTO book SET ?', newData, (err, book) => {
        if (err) {
            result(err, book)
        } else {
            result(null, {
                id: book.insertId,
                ...newData
            })
        }
    })
}

//xóa sách 
Book.Remove = (id, result) => {
    const db_delete = `DELETE FROM book WHERE book_id =${id}`;

    sql.query(db_delete, (err) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, "xóa dữ liệu sách có id: " + id + " Thành công!");
    });
};

// //Sửa thông tin sách 
// Book.update = (data, result) => {

//     sql.query("UPDATE book SET content=?,image=? WHERE id=?", [data.content, data.image, data.id], (err, res) => {
//         if (err) {
//             result(err, null)
//             return;
//         } else {
//             result(null, res)
//         }
//     })
// }

//thêm ảnh và file 
Book.upload = (newData, result) => {
    const db = 'INSERT INTO booK_img_file SET ?';
    sql.query(db, newData, (err, book) => {
        if (err) {
            console.error("Error inserting data:", err);
            result(err, null)
            return;
        }
        console.log("Data inserted successfully:", book);
        result(null, book);
    })
}
//==================================================================================


Book.get_image_fileDB = (id, callback) => {
    const db = `SELECT * FROM book_img_file WHERE book_id=${id}`
    sql.query(db, (err, data) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, data)
        }
    })
}

//================================================================================S
Book.getCategory = (result) => {
    const db = `
    SELECT *
    FROM book_category 
    
    `
    sql.query(db, (err, books) => {
        if (err) {
            result(err, null);
        } else {
            result(books);
        }
    });
}

Book.getAllSuppliers = (result) => {
    const db = `
    SELECT * FROM book_supplier
    `
    sql.query(db, (err, book) => {
        if (err) {
            console.error("Database query error:", err);
            result(err, null);
        } else {
            result(book);
        }
    });
}
Book.getByCategoryID = (id, result) => {
    const db = `
    SELECT 
    book.book_id,
    book.book_title,
    book.price,
    book_img_file.image_path,
    book.category_id,
    book_category.category_name
    FROM
        book
    LEFT JOIN book_img_file 
        ON book.book_id = book_img_file.book_id
    LEFT JOIN book_category 
        ON book.category_id = book_category.category_id
    WHERE
        book.category_id = ?
    `;

    // Use an array to provide the actual value for the placeholder
    sql.query(db, [id], (err, book) => {
        if (err) {
            result(err, null)
        } else {

            result(book)

        }
    });
}


Book.addCategory = (newData, result) => {
    sql.query('INSERT INTO book_category (category_name) VALUES (?)', [newData.category_name], (err, category) => {
        if (err) {
            result(err, category);
        } else {
            result(null, {
                id: category.insertId,
                category_name: newData.category_name
            });
        }
    });

};
Book.searchByName = (searchTerm, result) => {
    const db = `
        SELECT
            book.book_id,
            book.book_title,
            book.author,
            book.publication_year,
            book.price,
            book.supplier_id,
            book.category_id,
            book_img_file.image_path,
            book_category.category_name
        FROM
            book
        LEFT JOIN book_img_file ON book.book_id = book_img_file.book_id
        LEFT JOIN book_category ON book.category_id = book_category.category_id
        WHERE
            book.book_title LIKE ?
    `;
    const searchPattern = `%${searchTerm}%`;

    sql.query(db, [searchPattern], (err, products) => {
        if (err) {
            result(err, null);
        } else {
            result(products);
        }
    });
};

Book.checkPayment = (account_id, book_id, callback) => {
    const db = `
    SELECT vnp_TransactionStatus
    FROM receipt
    WHERE account_id = ${account_id}
        AND book_id = ${book_id}
    `
    sql.query(db, (err, data) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, data)
            console.log(data);
        }
    })
}


Book.check_bookID_in_Receipt = (account_id, book_id, callback) => {
    const db = `
    SELECT count(*) AS StatusPayment 
    FROM receipt  
    WHERE 
    book_id = ${book_id} AND account_id=${account_id}
    `
    sql.query(db, (err, data) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, data)
        }
    })
}

// comment 
const Comment = function (comment) {
    this.book_id = comment.book_id;
    this.account_id = comment.account_id;
    this.name_user = comment.name_user;
    this.comments = comment.comments; // Ensure this line is correct
    this.created_at = new Date();
    this.updated_at = new Date();
};

Comment.addComment = (newComment, result) => {
    console.log(newComment);
    sql.query('INSERT INTO comments SET ?', newComment, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            // Fetch the inserted comment by its ID
            sql.query('SELECT * FROM comments WHERE id = ?', res.insertId, (err, comment) => {
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
    const db = 'SELECT * FROM comments WHERE book_id = ?';
    sql.query(db, [bookId], (err, comments) => {
        if (err) {
            result(err, null);
        } else {
            result(null, comments);
        }
    });
};

// Add other comment-related functions as needed
module.exports = Book, Comment;