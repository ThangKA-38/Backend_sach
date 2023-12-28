const Book = require('../models/Book_model')
const pdftk = require('node-pdftk')
const jwtDecode = require("jwt-decode");
const mysql = require('../models/db')

// hiển thị sách ra web
exports.ShowBook_full = (req, res) => {
    const id = req.params.book_id
    Book.getBook_fullPage(id, (data) => {
        const bookFilePath = `/public/upload/${data.map(item => item.file_path)}`;
        const imageFilePath = `/public/upload/${data.map(item => item.image_path)}`;

        res.json({ data, bookFilePath })
    })
}
// show sách theo id
exports.detailBooK = (req, res, err) => {
    var id = req.params.id;
    Book.findByID(id, (err, data) => {
        if (!data) {
            res.status(404).json({ error: 'Book not found' });
        } else {
            res.status(200).json({ detail: data });
        }
    })
}

exports.showDataNewBook = (req, res) => {
    Book.getBook_fullPage((data) => {
        res.json({ book: data })
    })
}

exports.All_CataCategory = (req, res) => {
    Book.getCategory((data) => {
        res.json({ category: data })
    })
}

exports.All_supplier = (req, res) => {
    Book.getAllSuppliers((data) => {
        res.json({ suppliers: data }); // Sửa key từ "category" thành "suppliers"
    });
};

//Thêm sách mới
exports.createNewBook = async (req, res) => {
    console.log(req.files);
    const newData = {
        book_title: req.body.bookTitle,
        author: req.body.author,
        publication_year: req.body.publicationYear,
        price: req.body.price,

    };
    newData.category_id = req.body.category; // lấy id danh mục có sẵn
    newData.supplier_id = req.body.supplier;
    addNewBook(newData)

    function uploadFiles(Book_id) {
        // Upload file
        if (req.fileValidationError) {
            //return res.status(400).send(req.fileValidationError);
            console.log(req.fileValidationError);
        } else if (!req.files || !req.files['fileElem'] || !req.files['myImage']) {
            //return res.status(400).send('Please select both files to upload');
            console.log('Please select both files to upload');
        }

        const file_path = req.files['fileElem'][0].filename;
        const image_path = req.files['myImage'][0].filename;

        newUpload = {
            Book_id,
            file_path,
            image_path
        }
        Book.upload(newUpload, (err) => {
            if (err) {
                res.status(401).json(err);
            }
        })
    };
    //hàm thêm sách

    function addNewBook(data) {
        Book.addBook(data, (err, bookData) => {
            if (err) {
                res.status(401).json(err);
            } else {
                var book_id = bookData.id;

                uploadFiles(book_id);
                cutfile_PDF(book_id)

                Book.get_image_fileDB(book_id, (dataUpload) => {
                    const bookFilePath_5page = `/public/upload/${dataUpload.map(item => item.file_path)}`;
                    //  const bookFilePath = `/public/upload/${dataUpload.map(item => item.file_path)}`;
                    const imageFilePath = `/public/upload/${dataUpload.map(item => item.image_path)}`;
                    res.json({
                        'new booK': book_id,
                        data,
                        bookFilePath_5page,
                        imageFilePath
                    })
                })

            }
        })
    };


    function cutfile_PDF(id) {
        Book.get_image_fileDB(id, (data) => {
            try {
                const inputPath = `/public/upload/${data.map(item => item.file_path)}`
                // tạo file output.pdf
                const outputPath = `public/upload/output_${data.map(item => item.file_path)}`;

                pdftk.input(inputPath)
                    .cat('1-5') // Keep only page 1
                    .output(outputPath);
                const newFile = {
                    book_id: id,
                    file_path_5page: `output_${data.map(item => item.file_path)}`,
                    image_path: `${data.map(item => item.image_path)}`
                }
                Book.upload_5page(newFile, () => { })

            } catch (error) {
                // If an error occurs, send an error response to the client
                console.error("Error:", error);
            }
        })

    }
    // function addNewCateg(data) {
    //     Book.addCategory(data, (err, category) => {
    //         if (err) {
    //             res.status(401).json(err);
    //         } else {
    //             newData.category_id = category.id; //thêm category_id  mới vào newData
    //         }
    //     })
    // };

    // function addNewSupplier(data, callback) {
    //     Book.addSupplier(data, (err, supplier) => {
    //         newData.supplier_id = supplier.id; //thêm category_id  mới vào newData
    //     });
    // }
};

//xóa sách 

exports.removeBook = (req, res) => {
    var id = req.params.id;
    Book.Remove(id, (err, message) => {
        if (err) {
            res.json("Error : " + err)
        } else {
            res.status(200).json(
                message
            );
        }
    })
}

// exports.uploadFile = (req, res, err) => {
//     if (req.fileValidationError) {
//         return res.status(400).send(req.fileValidationError);
//     } else if (!req.files || !req.files['fileElem'] || !req.files['myImage']) {
//         return res.status(400).send('Please select both files to upload');
//     }

//     Book_id = req.params.id;
//     var fileBook = req.files['fileElem'][0].filename;
//     var fileIMG = req.files['myImage'][0].filename;
//     // Construct the file paths
//     const bookFilePath = `/public/upload/${fileBook}`;
//     const imageFilePath = `/public/upload/${fileIMG}`;

//     Book.upload([Book_id, fileBook, fileIMG], () => {
//         // Return the file paths in the response
//         res.json({ data: [Book_id, bookFilePath, imageFilePath] });
//     });
// }


//lấy theo danh mục sách
exports.categoryBookByID = (req, res) => {
    const category_id = req.params.id; // Get the category ID from the request
    Book.getByCategoryID(category_id, (data) => {
        res.json({ Data: data });
    });
};

exports.searchProduct = (req, res) => {
    const searchTerm = req.query.searchTerm;

    Book.searchByName(searchTerm, (data) => {
        res.status(200).json({ products: data });
    });
};


// hàm cắt file pdf
// exports.Cut_File_PDF = (req, res) => {
//     const token = (req.get("Authorization")).split(" ")[1].trim();
//     const account_id = jwtDecode.jwtDecode(token, { header: false }).account_id;
//     var book_id = req.params.book_id


//     Book.get_image_fileDB(book_id, (data) => {
//         try {
//             // Construct the absolute paths for the input and output PDF files
//             const inputPath = `/public/upload/${data.map(item => item.file_path)}`
//             // tạo file output.pdf
//             const outputPath = `public/upload/output_${data.map(item => item.file_path)}`;
//             // Use node-pdftk to process the PDF
//             pdftk.input(inputPath)
//                 .cat('1-5') // Keep only page 1
//                 .output(outputPath);
//             const newFile = {
//                 book_id,
//                 file_path_5page: `output_${data.map(item => item.file_path)}`,
//                 image_path: `${data.map(item => item.image_path)}`
//             }
//             Book.upload_5page(newFile, () => { })

//             Book.checkPayment(account_id, book_id, (err, data) => {
//                 if (data[0].vnp_TransactionStatus == '00') {
//                     res.json({
//                         book_id,
//                         "File original:": inputPath
//                     });
//                 } else {
//                     res.json({
//                         book_id,
//                         "File only 5 page:": outputPath
//                     })
//                 }
//             })

//         } catch (error) {
//             // If an error occurs, send an error response to the client
//             res.status(500).json({ error: "PDF cutting failed", details: error.message });
//             console.error("Error:", error);
//         }
//     })

// }

// hàm cắt file pdf
// exports.Cut_File_PDF = (req, res) => {
//     const token = (req.get("Authorization")).split(" ")[1].trim();
//     const account_id = jwtDecode.jwtDecode(token, { header: false }).account_id;
//     var book_id = req.params.book_id


//     Book.get_image_fileDB(book_id, (data) => {
//         try {
//             // Construct the absolute paths for the input and output PDF files
//             const inputPath = `/public/upload/${data.map(item => item.file_path)}`
//             // tạo file output.pdf
//             const outputPath = `public/upload/output_${data.map(item => item.file_path)}`;
//             // Use node-pdftk to process the PDF
//             pdftk.input(inputPath)
//                 .cat('1-5') // Keep only page 1
//                 .output(outputPath);
//             const newFile = {
//                 book_id,
//                 file_path_5page: `output_${data.map(item => item.file_path)}`,
//                 image_path: `${data.map(item => item.image_path)}`
//             }
//             Book.upload_5page(newFile, () => { })

//             Book.checkPayment(account_id, book_id, (err, data) => {
//                 if (data[0].vnp_TransactionStatus == '00') {
//                     res.json({
//                         book_id,
//                         "File original:": inputPath
//                     });
//                 } else {
//                     res.json({
//                         book_id,
//                         "File only 5 page:": outputPath
//                     })
//                 }
//             })

//         } catch (error) {
//             // If an error occurs, send an error response to the client
//             res.status(500).json({ error: "PDF cutting failed", details: error.message });
//             console.error("Error:", error);
//         }
//     })

// }

exports.Cut_File_PDF = (req, res) => {
    var book_id = req.params.book_id
    Book.get_image_fileDB(book_id, (err, data) => {
        try {
            console.log(data);
            // Construct the absolute paths for the input and output PDF files
            const inputPath = `/public/upload/${data.map(item => item.file_path)}`
            // tạo file output.pdf
            const outputPath = `public/upload/output_${data.map(item => item.file_path)}`;
            // Use node-pdftk to process the PDF
            pdftk.input(inputPath)
                .cat('1-5') // Keep only page 1
                .output(outputPath);
            const newFile = {
                book_id,
                file_path_5page: `output_${data.map(item => item.file_path)}`,
                image_path: `${data.map(item => item.image_path)}`
            }
            res.json({
                book_id,
                "File only 5 page:": outputPath,
                "File original:": inputPath,
                message: "cut and save file PDF in db success"
            });
        } catch (error) {
            // If an error occurs, send an error response to the client
            res.status(500).json({ error: "PDF cutting failed", details: error.message });
            console.error("Error:", error);
        }
    })
}


// hiển thị sách ra web
exports.check_payment_pdf = (req, res) => {
    const token = (req.get("Authorization")).split(" ")[1].trim();
    const account_id = jwtDecode.jwtDecode(token, { header: false }).account_id;
    var book_id = req.params.book_id

    Book.get_image_fileDB(book_id, (err, data) => {
        try {
            const inputPath = `/public/upload/${data.map(item => item.file_path)}`
            // tạo file output.pdf
            const outputPath = `public/upload/output_${data.map(item => item.file_path)}`;
            // Use node-pdftk to process the PDF
            pdftk.input(inputPath)
                .cat('1-5') // Keep only page 1
                .output(outputPath)
                .then(() => {
                    //kiểm tra id có trong dc chưa
                    Book.check_bookID_in_Receipt(book_id, (err, data_status) => {
                        if (data[0].StatusPayment == 0) {
                            return res.json({
                                book_id,
                                "File only 5 page:": outputPath,
                                message: "Sách này chưa thanh toán"
                            })
                        } else {
                            // kiểm tra id đó đã thanh toán chưa
                            Book.checkPayment(account_id, book_id, (err, data) => {

                                if (data[0].vnp_TransactionStatus == '00') {
                                    return res.json({
                                        book_id,
                                        "File original:": inputPath,
                                        message: "Thanh toán thành công"
                                    });
                                } else {
                                    res.json({
                                        book_id,
                                        "File only 5 page:": outputPath,
                                        message: "Sách này chưa thanh toán"
                                    })
                                }
                            })
                        }
                    })
                })

        } catch (error) {
            // If an error occurs, send an error response to the client
            res.status(500).json({ error: "PDF cutting failed", details: error.message });
            console.error("Error:", error);
        }
    })
}
