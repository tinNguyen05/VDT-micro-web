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

const orders = [];

app.post('/orders', (req, res) => {
    const { productId, quantity } = req.body;
    const newOrder = {
        id: orders.length + 1,
        productId,
        quantity,
        status: 'Processing'
    };
    orders.push(newOrder);
    res.status(201).json({ message: 'Đặt hàng thành công!', order: newOrder });
});

app.get('/orders', (req, res) => {
    res.json(orders);
});

app.listen(3002, () => {
    console.log('Order Service is running on port 3002');
});