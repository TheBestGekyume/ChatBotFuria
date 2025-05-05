const db = require('../../cfg/database');

module.exports = async (req, res) => {
    const { id } = req.params;

    try {
        // Executa a query para deletar o usuário
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

        // Verifica se nenhum usuário foi deletado
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Retorna a resposta de sucesso
        res.json({ message: 'Usuário deletado!' });
    } catch (err) {
        // Trata qualquer erro ocorrido durante a execução da query
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
