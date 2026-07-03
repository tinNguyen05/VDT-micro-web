const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Dữ liệu mẫu khởi tạo dựa theo ảnh của bạn
let users = [
    { id: 1, name: 'Trọng Tín', dob: '20/11/2005', email: 'trongtin.work1120@gmail.com', phone: '0867461105' }
];

// Lấy danh sách người dùng
app.get('/api/users', (req, res) => {
    res.json(users);
});

// Thêm người dùng mới
app.post('/api/users', (req, res) => {
    const newUser = { id: Date.now(), ...req.body };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Cập nhật người dùng (Sửa)
app.put('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === userId);

    if (index !== -1) {
        users[index] = { id: userId, ...req.body };
        res.json(users[index]);
    } else {
        res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
});

// Xóa người dùng
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    users = users.filter(u => u.id !== userId);
    res.json({ message: 'Đã xóa thành công' });
});

app.listen(3004, () => {
    console.log('User Service đang chạy tại port 3004');
});