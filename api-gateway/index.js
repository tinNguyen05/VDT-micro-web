const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const promBundle = require('express-prom-bundle');

const app = express();
app.use(express.json());

// ---------------------------------------------------------
// [THÊM MỚI] MONITORING: Tích hợp Prometheus Metrics
// ---------------------------------------------------------
// Middleware này tự động đo lường mọi request và tạo sẵn endpoint GET /metrics
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    customLabels: { app: 'api-gateway' },
    promClient: {
        collectDefaultMetrics: {}
    }
});
app.use(metricsMiddleware);

// ---------------------------------------------------------
// 4. RATE LIMITING: Chống DDoS 
// ---------------------------------------------------------
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    statusCode: 409,
    message: { error: "Bạn đã vượt quá giới hạn request/phút." }
});

// LƯU Ý KHI DEMO ROLLBACK:
// Khi bắn tải (load test), em phải comment dòng app.use(limiter) lại.
// Nếu không, rate limit 409 sẽ làm nhiễu tỷ lệ lỗi 500 của Prometheus.


//  app.use(limiter); // TẠM TẮT KHI DEMO CANARY ROLLBACK


const SECRET_KEY = 'viettel_vdt_2026_super_secret_key';

// ---------------------------------------------------------
// 1. ENDPOINT: ĐĂNG NHẬP (Chỉ lấy Token, không sửa)
// ---------------------------------------------------------
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let role = 'user';

    if (username === 'admin' && password === 'admin123') {
        role = 'admin';
    } else if (username === 'user' && password === 'user123') {
        role = 'user';
    } else {
        return res.status(401).json({ error: 'Sai thông tin đăng nhập!' });
    }

    const token = jwt.sign({ username, role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Đăng nhập thành công', role: role, token: token });
});

// ---------------------------------------------------------
// 2. MIDDLEWARE: KIỂM TRA TOKEN & PHÂN QUYỀN (Không sửa)
// ---------------------------------------------------------
const verifyTokenAndRole = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Truy cập bị từ chối: Không có Token!' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn!' });
        req.user = decoded;
        const userRole = req.user.role;
        const method = req.method;

        if (userRole === 'user' && (method === 'POST' || method === 'DELETE' || method === 'PUT')) {
            return res.status(403).json({ error: 'HTTP 403 Forbidden: Tài khoản "user" không có quyền này.' });
        }
        next();
    });
};

// ---------------------------------------------------------
// 3. CÁC ENDPOINT ĐÃ ĐƯỢC BẢO VỆ 
// ---------------------------------------------------------
app.get('/api/users', verifyTokenAndRole, (req, res) => {


    // --------------------------------------------------------

    return res.status(500).json({
        error: "🔥 LỖI HỆ THỐNG - BẢN CẬP NHẬT GÂY CRASH APP! 🔥"
    });


    // --------------------------------------------------------

    // res.json({ message: 'GET: Đọc dữ liệu thành công', user: req.user.username });
});

app.post('/api/users', verifyTokenAndRole, (req, res) => {
    res.json({ message: 'POST: Thêm dữ liệu thành công', user: req.user.username });
});

app.delete('/api/users', verifyTokenAndRole, (req, res) => {
    res.json({ message: 'DELETE: Xóa dữ liệu thành công', user: req.user.username });
});

app.listen(8080, () => {
    console.log('API Gateway is running on port 8080');
});