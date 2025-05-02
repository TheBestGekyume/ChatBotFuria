const db = require('../../configuration/database');

module.exports = (req, res) => {
    db.query('SELECT * FROM messages ORDER BY sent_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};
