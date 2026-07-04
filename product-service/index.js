const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const app = express();

app.use(cors());
app.use(express.json());

client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

const products = [
    { id: 1, name: 'Laptop Dell XPS', price: 1500 },
    { id: 2, name: 'iPhone 15 Pro', price: 1000 }
];

app.get('/products', (req, res) => {
    res.json(products);
});

// Chuyển sang port 3002 cho khớp với values.yaml
app.listen(3002, '0.0.0.0', () => {
    console.log('Product Service is running on port 3002');
});