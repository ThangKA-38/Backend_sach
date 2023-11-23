const sql = require('./db');

const Book = (book) => {
    this.book_title = book.book_title
    this.author = book.author
    this.publication_year = book.publication_year
    this.price = book.price
    this.supplier_id = -book.supplier_id
    this.category_id = book.category_id
}
Book.getBook_fullPage = (result) => {
    const db = `
    SELECT  book.book_id,book.book_title,book.price, i.file_path,i.image_path
    from book 
    LEFT JOIN book_img_file i
    ON book.book_id = i.book_id
    GROUP BY  book.book_id,book.book_title,book.price, i.file_path,i.image_path
    `
    sql.query(db, (err, book) => {
        if (err) {
            result(err, null)
        } else {
            result(book)
        }
    })
}

Book.getBook_5Page = (id, result) => {
    //         const db = `
    //     SELECT  book.book_id,book.book_title,book.price, i.file_path_5page,i.image_path
    //     from book 
    //     LEFT JOIN book_img_file_5page i 
    //     ON book.book_id = i.book_id
    //     GROUP BY book.book_id,book.book_title,book.price, i.file_path_5page,i.image_path
    // `
    //         sql.query(db, (err, book) => {
    //             if (err) {
    //                 result(err, null)
    //             } else {
    //                 result(book)
    //             }
    //         })
    const bookQuery = `
        SELECT * FROM book_img_file WHERE book_id = ${id};
    `;

    sql.query(bookQuery, (err, bookInfo) => {
        if (err) {
            return result(err, null);
        }

        const page5Query = `
            SELECT * FROM book_img_file_5page WHERE book_id = ${id};
        `;

        sql.query(page5Query, (err, page5Info) => {
            if (err) {
                return result(err, null);
            }

            // Assuming you want to return both sets of data
            result(null, { bookInfo, page5Info });
        });
    });

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
Book.findByID = (id, result) => {
    const db = `
    SELECT * from book
    LEFT JOIN book_img_file 
    ON book.book_id = book_img_file.book_id
    LEFT JOIN book_supplier 
    ON book.supplier_id = book_supplier.supplier_id
    LEFT JOIN book_category 
    ON book.category_id = book_category.category_id
    HAVING book.book_id = ${id}
`;
    sql.query(db, (err, book) => {
        if (err) {
            result(err, null)
        } else {
            result(book)
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
    const deleteImgQuery = `DELETE FROM book_img_file WHERE book_id = ${id}`;
    const deleteBookQuery = `DELETE FROM book WHERE book_id = ${id}`;

    sql.query(deleteImgQuery, (err) => {
        if (err) {
            result(err, null);
            return;
        }

        sql.query(deleteBookQuery, (err) => {
            if (err) {
                result(err, null);
                return;
            }

            result("xóa dữ liệu sách có id: " + id + " Thành công!");
        });
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

Book.upload_5page = (newData, callback) => {
    const checkQuery = `SELECT * FROM booK_img_file_5page WHERE book_id=${newData.book_id}`;
    sql.query(checkQuery, (err, checkData) => {
        if (err) {
            console.error("Error checking book_id existence:", err);
            callback(err, null);
            return;
        }
        if (checkData && checkData.length > 0) {
            // Nếu book_id đã tồn tại, không thực hiện thêm dữ liệu mới
            callback({ message: "Book with this ID already exists in booK_img_file_5page. Upload not allowed." }, null);
        } else {
            // Nếu book_id chưa tồn tại, thực hiện thêm dữ liệu mới
            const db = 'INSERT INTO booK_img_file_5page SET ?';
            sql.query(db, newData, (err, book) => {
                if (err) {
                    console.error("Error inserting data:", err);
                    callback(err, null);
                }
                callback(null, book);
            });
        }
    });
};

Book.get_image_fileDB = (id, callback) => {
    const db = `SELECT * FROM book_img_file WHERE book_id=${id}`
    sql.query(db, (err, data) => {
        if (err) {
            callback(err, null)
        } else {
            callback(data)
        }
    })
}

Book.get_image_fileDB_5page = (id, callback) => {
    const db = `SELECT * FROM book_img_file_5page WHERE book_id=${id}`
    sql.query(db, (err, data) => {
        if (err) {
            callback(err, null)
        } else {
            callback(data)
        }
    })
}
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


//giỏ hàng
Book.insertCart = (data, callback) => {
    const db = `INSERT INTO cart SET ?`
    sql.query(db, data, (err) => {
        if (err) {
            console.error("Error inserting data:", err);
            callback(err, null)
        } else {
            callback(data, null)
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