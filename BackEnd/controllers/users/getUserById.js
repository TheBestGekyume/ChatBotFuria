const db = require('../../cfg/database');

module.exports = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Executa a query para buscar o usuário pelo ID
        const [results] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        
        // Verifica se algum resultado foi encontrado
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Retorna o usuário encontrado
        res.json(results[0]);
    } catch (err) {
        // Em caso de erro, envia a resposta com erro
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
