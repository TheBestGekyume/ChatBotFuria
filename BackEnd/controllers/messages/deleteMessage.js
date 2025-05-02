const db = require('../../configuration/database');

module.exports = (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) return res.status(400).json({ error: 'Informe user_id.' });

    // Verifica se a mensagem pertence ao usuário
    db.query('SELECT * FROM messages WHERE id = ? AND user_id = ?', [id, user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Mensagem não encontrada ou não pertence ao usuário.' });

        // Deleta a mensagem
        db.query('DELETE FROM messages WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Mensagem deletada!' });
        });
    });
};
