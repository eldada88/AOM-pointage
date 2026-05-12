const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.get('/', (req, res) => {
    res.send('API RH Pointage Active');
});

app.post('/login', async (req, res) => {

    const { nom, password } = req.body;

    const result = await pool.query(
        'SELECT * FROM users WHERE nom=$1',
        [nom]
    );

    const user = result.rows[0];

    if (!user) {
        return res.json({ success: false });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (valid) {

        res.json({
            success: true,
            user: {
                id: user.id,
                nom: user.nom,
                role: user.role
            }
        });

    } else {

        res.json({
            success: false
        });

    }
});

app.post('/logs', async (req, res) => {

    const {
        user_id,
        action,
        timestamp,
        date
    } = req.body;

    await pool.query(
        `INSERT INTO logs(
            user_id,
            action_type,
            timestamp,
            work_date
        )
        VALUES($1,$2,$3,$4)`,
        [user_id, action, timestamp, date]
    );

    res.json({
        success: true
    });
});

app.get('/logs', async (req, res) => {

    const result = await pool.query(
        `SELECT logs.*, users.nom
         FROM logs
         JOIN users ON users.id = logs.user_id
         ORDER BY timestamp DESC`
    );

    res.json(result.rows);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Serveur démarré');
});
