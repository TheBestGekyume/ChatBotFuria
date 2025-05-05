const db = require('../../cfg/database');

module.exports = async (req, res) => {
    try {
        // Executa a query para buscar todos os usuários
        const [results] = await db.query('SELECT * FROM users');
        
        // Retorna os resultados como resposta
        res.json(results);
    } catch (err) {
        // Em caso de erro, envia a resposta com erro
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
