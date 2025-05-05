const bcrypt = require('bcrypt');
const db = require('../../cfg/database');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const saltRounds = 10;

module.exports = async (req, res) => {
    const { id } = req.params;
    const { username, password, email, role } = req.body;

    try {
        // Se houver uma senha, faz a hash da senha
        let passwordToSave = password;
        if (password) {
            passwordToSave = await bcrypt.hash(password, saltRounds);
        }

        // Define a query e os valores de acordo com a presença do role
        let sql, values;
        if (role !== undefined) {
            sql = 'UPDATE users SET username = ?, password = ?, email = ?, role = ? WHERE id = ?';
            values = [username, passwordToSave, email, role, id];
        } else {
            sql = 'UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?';
            values = [username, passwordToSave, email, id];
        }

        // Executa a query para atualizar o usuário
        const [result] = await db.query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Após a atualização, busca o usuário para gerar o token
        const [rows] = await db.query('SELECT id, username, email FROM users WHERE id = ?', [id]);
        const user = rows[0];

        // Gera o token JWT para o usuário
        const updatedToken = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            secret,
            { expiresIn: "1h" }
        );

        // Retorna a resposta com o token e os dados do usuário
        res.json({
            message: 'Usuário atualizado!',
            token: updatedToken,
            user: { id: user.id, username: user.username }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
