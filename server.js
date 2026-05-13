const express = require('express');
const cors = require('cors');
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
    res.send('API RH ACTIVE');
});


// LOGIN
app.post('/login', async (req, res) => {

    const { nom, password } = req.body;

    const result = await pool.query(
        'SELECT * FROM users WHERE nom=$1 AND password=$2',
        [nom, password]
    );

    if (result.rows.length === 0) {
        return res.json({
            success: false
        });
    }

    res.json({
        success: true,
        user: result.rows[0]
    });
});


// GET USERS
app.get('/users', async (req, res) => {

    const result = await pool.query(
        'SELECT * FROM users ORDER BY nom'
    );

    res.json(result.rows);
});


// ADD USER
app.post('/users', async (req, res) => {

    const { nom, password, role } = req.body;

    await pool.query(
        'INSERT INTO users(nom,password,role) VALUES($1,$2,$3)',
        [nom, password, role]
    );

    res.json({
        success: true
    });
});


// GET LOGS
app.get('/logs', async (req, res) => {

    const result = await pool.query(
        'SELECT * FROM logs ORDER BY timestamp DESC'
    );

    res.json(result.rows);
});


// ADD LOG
app.post('/logs', async (req, res) => {

    const { nom, action, timestamp, date } = req.body;

    await pool.query(
        'INSERT INTO logs(nom,action,timestamp,date) VALUES($1,$2,$3,$4)',
        [nom, action, timestamp, date]
    );

    res.json({
        success: true
    });
});


// GET LEAVES
app.get('/leaves', async (req, res) => {

    const result = await pool.query(
        'SELECT * FROM leaves ORDER BY id DESC'
    );

    res.json(result.rows);
});


// ADD LEAVE
app.post('/leaves', async (req, res) => {

    const leave = req.body;

    await pool.query(
        `INSERT INTO leaves(
            id,
            nom,
            type,
            dateDebut,
            dateFin,
            motif,
            status,
            days
        )
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
            leave.id,
            leave.nom,
            leave.type,
            leave.dateDebut,
            leave.dateFin,
            leave.motif,
            leave.status,
            leave.days
        ]
    );

    res.json({
        success: true
    });
});


// UPDATE LEAVE
app.put('/leaves/:id', async (req, res) => {

    const { status } = req.body;

    await pool.query(
        'UPDATE leaves SET status=$1 WHERE id=$2',
        [status, req.params.id]
    );

    res.json({
        success: true
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('SERVEUR ACTIF');
});
