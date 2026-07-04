const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const app = express();

const morgan = require('morgan');

// Ép định dạng log in ra chuẩn: "GET /api/users 200"
app.use(morgan(':method :url :status'));

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

// Chuyển sang port 3001 cho khớp với values.yaml
app.listen(3001, '0.0.0.0', () => {
    console.log('Order Service is running on port 3001');
});