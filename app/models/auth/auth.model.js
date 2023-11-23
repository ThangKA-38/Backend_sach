const sql = require('../db');

function User(user) {
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.role_id = user.role_id;
}

User.getAll_Account = (result) => {
    const query = `
        SELECT a.username, a.email, r.role_name
        FROM account AS a
        JOIN role AS r ON a.role_id = r.role_id
    `;

    sql.query(query, (err, users) => {
        if (err) {
            console.error(err);
            result(null);
        } else {
            result(users);
        }
    });
};

User.createUser = (newUser, result) => {
    sql.query('INSERT INTO account SET ?', newUser, (err, res) => {
        if (err) {
            console.log("error :", err)
            result(err, null);
            return;
        }
        console.log("create user : ", { account_id: res.insertId, ...newUser });
        result(null, { account_id: res.insertId, ...newUser });
    });
}



User.findByEmail = (email, result) => {
    sql.query('SELECT * FROM account WHERE email = ?', [email, result], (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
            return;
        }
        result(null, null);
    });
}

module.exports = User;