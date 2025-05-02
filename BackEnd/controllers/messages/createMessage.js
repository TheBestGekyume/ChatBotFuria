const db = require('../../configuration/database');

module.exports = (req, res) => {
    const { user_id, content } = req.body;
    if (!user_id || !content) return res.status(400).json({ error: 'Informe user_id e content.' });

    db.query('INSERT INTO messages (user_id, content) VALUES (?, ?)', [user_id, content], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Mensagem criada!', messageId: result.insertId });
    });
};
