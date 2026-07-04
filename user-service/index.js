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

let users = [
    { id: 1, name: 'Trọng Tín', dob: '20/11/2005', email: 'trongtin.work1120@gmail.com', phone: '0867461105' }
];

app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/users', (req, res) => {
    const newUser = { id: Date.now(), ...req.body };
    users.push(newUser);
    res.status(201).json(newUser);
});

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

app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    users = users.filter(u => u.id !== userId);
    res.json({ message: 'Đã xóa thành công' });
});

app.listen(3004, () => {
    console.log('User Service đang chạy tại port 3004');
});