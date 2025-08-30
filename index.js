// importing packages
const express = require('express');
const cors = require('cors');
const app = express();

// import the router once
const gamesRouter = require('./routes/routes');

// middleware
app.use(express.json());
app.use(cors());

// mount the router at /api/games
app.use('/api/games', gamesRouter);

// port
const port = process.env.PORT || 5500;
app.listen(port, () => console.log(`Server running on port ${port}`));
