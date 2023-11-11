const Book = require('../models/Book_model')
const multer = require('multer');

// hiển thị sách ra web
exports.ShowBook = (req, res) => {
    Book.getBook((data) => {
        res.status(200).json({ listBooK: data });
    })
}

// show sách theo id
exports.detailBooK = (req, res, err) => {
    var id = req.params.id;
    Book.findByID(id, (data) => {
        if (!data) {
            res.status(404).json({ error: 'Book not found' });
        } else {
            res.status(200).json({ detail: data });
        }
    })
}

exports.showDataCategory = (req, res) => {
    Book.getCategory((data) => {
      res.json({ dataCategory: data })
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
exports.createNewBook = (req, res) => {
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
            return res.status(400).send(req.fileValidationError);
        } else if (!req.files || !req.files['fileElem'] || !req.files['myImage']) {
            return res.status(400).send('Please select both files to upload');
        }

        const file_path = req.files['fileElem'][0].filename;
        const image_path = req.files['myImage'][0].filename;

        newUpload = {
            Book_id, file_path, image_path
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
                Book.get_image_fileDB(book_id, (dataUpload) => {

                    const bookFilePath = `/public/upload/${dataUpload.map(item => item.file_path)}`;
                    const imageFilePath = `/public/upload/${dataUpload.map(item => item.image_path)}`;

                    res.json({ 'new booK': book_id, data, bookFilePath, imageFilePath })
                })
            }
        })
    };

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
    Book.Remove(id, (err) => {
        res.status(200).json({ message: 'Book deleted successfully' });
    })
}


//lấy theo danh mục sách
exports.categoryBook = (req, res) => {
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
