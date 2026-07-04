const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Khóa bí mật dùng để ký và giải mã Token (Trong thực tế sẽ để ở file .env)
const SECRET_KEY = 'viettel_vdt_2026_super_secret_key';

// ---------------------------------------------------------
// 1. ENDPOINT: MÔ PHỎNG ĐĂNG NHẬP VÀ CẤP TOKEN
// ---------------------------------------------------------
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let role = 'user'; // Mặc định là user thường

    // Phân quyền cơ bản dựa trên tài khoản (Giả lập DB)
    if (username === 'admin' && password === 'admin123') {
        role = 'admin';
    } else if (username === 'user' && password === 'user123') {
        role = 'user';
    } else {
        return res.status(401).json({ error: 'Sai thông tin đăng nhập!' });
    }

    // Tạo JWT Token chứa payload (username, role) với hạn dùng 1 giờ
    const token = jwt.sign({ username, role }, SECRET_KEY, { expiresIn: '1h' });

    res.json({
        message: 'Đăng nhập thành công',
        role: role,
        token: token
    });
});

// ---------------------------------------------------------
// 2. MIDDLEWARE: KIỂM TRA TOKEN & PHÂN QUYỀN (RBAC)
// ---------------------------------------------------------
const verifyTokenAndRole = (req, res, next) => {
    // Lấy token từ header "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Truy cập bị từ chối: Không có Token!' });

    // Giải mã token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn!' });

        req.user = decoded; // Lưu payload (username, role) vào req để dùng ở bước sau

        // LOGIC PHÂN QUYỀN RBAC:
        const userRole = req.user.role;
        const method = req.method;

        if (userRole === 'user') {
            // Role "user" bị cấm dùng POST, DELETE, PUT
            if (method === 'POST' || method === 'DELETE' || method === 'PUT') {
                return res.status(403).json({
                    error: 'HTTP 403 Forbidden: Tài khoản "user" không có quyền thực hiện hành động thao tác dữ liệu này.'
                });
            }
        }

        // Nếu qua được các vòng kiểm duyệt thì cho phép đi tiếp vào Controller
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