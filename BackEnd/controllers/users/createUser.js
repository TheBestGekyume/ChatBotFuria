const bcrypt = require('bcrypt');
const db = require('../../cfg/database');
const saltRounds = 10;

module.exports = (req, res) => {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Preencha username, password e email' });
    }

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Erro ao gerar hash da senha' });

        const sql = role 
            ? 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)' 
            : 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';

        const values = role 
            ? [username, hashedPassword, email, role] 
            : [username, hashedPassword, email];

        db.query(sql, values, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Usuário criado!', userId: result.insertId });
        });
    });
};
