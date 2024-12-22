const express = require('express');
const app = express();
const PORT = 3000;

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to NodeJS by Jenkins!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
