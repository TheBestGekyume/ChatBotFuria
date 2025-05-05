const bcrypt = require('bcrypt');
const db = require('../../cfg/database');
const saltRounds = 10;

module.exports = async (req, res) => {
    const { username, password, email, role } = req.body;

    // Verifica se os dados obrigatórios foram preenchidos
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Preencha username, password e email' });
    }

    try {
        // Cria o hash da senha de forma assíncrona
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Define a query e os parâmetros dependendo se o role é fornecido
        const sql = role 
            ? 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)' 
            : 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';

        const values = role 
            ? [username, hashedPassword, email, role] 
            : [username, hashedPassword, email];

        // Executa a query no banco de dados utilizando o pool e await
        const [result] = await db.query(sql, values);

        // Retorna a resposta com sucesso
        res.status(201).json({ message: 'Usuário criado!', userId: result.insertId });
    } catch (err) {
        // Trata erros no processo
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
