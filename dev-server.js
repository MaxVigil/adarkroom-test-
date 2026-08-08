import express from 'express';

const PORT = 8080;

const app = express();
app.use(express.static('.'));

app.listen(PORT, '127.0.0.1', () => console.log(`Listening on http://127.0.0.1:${PORT}`));
