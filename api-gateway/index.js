const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit'); // Bổ sung thư viện Rate Limit

const app = express();
app.use(express.json());

// ---------------------------------------------------------
// 4. RATE LIMITING: Chống DDoS (10 requests / 1 phút)
// ---------------------------------------------------------
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 10, // Tối đa 10 request cho mỗi IP
    statusCode: 409, // Trả về mã 409 Conflict theo đúng yêu cầu đề bài
    message: { error: "Bạn đã vượt quá giới hạn 10 request/phút. Vui lòng thử lại sau!" }
});
// Áp dụng Rate Limit cho toàn bộ các route
app.use(limiter);

// Khóa bí mật dùng để ký và giải mã Token
const SECRET_KEY = 'viettel_vdt_2026_super_secret_key';

// ---------------------------------------------------------
// 1. ENDPOINT: MÔ PHỎNG ĐĂNG NHẬP VÀ CẤP TOKEN
// ---------------------------------------------------------
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let role = 'user'; // Mặc định là user thường

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
// 2. MIDDLEWARE: KIỂM TRA TOKEN & PHÂN QUYỀN (RBAC)
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
            return res.status(403).json({ error: 'HTTP 403 Forbidden: Tài khoản "user" không có quyền thực hiện hành động thao tác dữ liệu này.' });
        }
        next();
    });
};

// ---------------------------------------------------------
// 3. CÁC ENDPOINT ĐÃ ĐƯỢC BẢO VỆ BỞI MIDDLEWARE
// ---------------------------------------------------------
app.get('/api/users', verifyTokenAndRole, (req, res) => {
    res.json({ message: 'GET: Đọc dữ liệu thành công', user: req.user.username });
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