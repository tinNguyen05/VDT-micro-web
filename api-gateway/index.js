const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const client = require('prom-client'); // Thêm thư viện metric

const app = express();
app.use(cors());

// Bật thu thập Metric mặc định
client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// Điều hướng request
app.use('/api/products', proxy('http://localhost:3001'));
app.use('/api/orders', proxy('http://localhost:3002'));

app.listen(3000, () => {
    console.log('API Gateway is running on port 3000');
});