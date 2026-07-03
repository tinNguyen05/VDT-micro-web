const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
app.use(cors());

// Điều hướng request bắt đầu bằng /api/products sang Product Service
app.use('/api/products', proxy('http://localhost:3001'));

// Điều hướng request bắt đầu bằng /api/orders sang Order Service
app.use('/api/orders', proxy('http://localhost:3002'));

app.listen(3000, () => {
    console.log('API Gateway is running on port 3000');
});