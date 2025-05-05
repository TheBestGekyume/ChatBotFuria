const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../cfg/database');
const router = express.Router();

const secret = process.env.JWT_SECRET;


router.post('/', async (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        if (results.length === 0) return res.status(401).json({ error: 'Usuário não encontrado!' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ error: 'Senha incorreta!' });

        const token = jwt.sign(
            { id: user.id, name: user.username, email: user.email },
            secret,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
            }
        });
    });
});


module.exports = router;
