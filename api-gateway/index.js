const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const client = require('prom-client');

const app = express();
app.use(cors());

client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// Sửa lại thành tên service của K8s thay vì localhost
app.use('/api/products', proxy('http://product-service:3002'));
app.use('/api/orders', proxy('http://order-service:3001'));

// K8s mong đợi port 8080
app.listen(8080, '0.0.0.0', () => {
    console.log('API Gateway is running on port 8080');
});