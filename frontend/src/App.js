import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3004/api/users';

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', dob: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({ name: '', dob: '', email: '', phone: '' });
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, dob: user.dob, email: user.email, phone: user.phone });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
      }
    }
  };

  // --- STYLE: Phong cách Dark Mode Hiện Đại ---
  const styles = {
    page: { backgroundColor: '#0f172a', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', color: '#e2e8f0' },
    container: { maxWidth: '1100px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    title: { margin: 0, color: '#38bdf8', fontSize: '24px', fontWeight: 'bold' },
    logoutBtn: { backgroundColor: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' },
    card: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    cardTitle: { marginTop: 0, marginBottom: '20px', color: '#f8fafc', fontSize: '18px', borderBottom: '1px solid #334155', paddingBottom: '12px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' },
    input: { width: '100%', padding: '12px', backgroundColor: '#0f172a', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' },
    btnSubmit: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px', width: '100%', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
    btnCancel: { backgroundColor: '#475569', color: 'white', border: 'none', padding: '12px', width: '100%', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#0f172a', color: '#94a3b8', padding: '15px', textAlign: 'left', fontSize: '14px', borderBottom: '2px solid #334155' },
    td: { padding: '15px', borderBottom: '1px solid #334155', fontSize: '15px' },
    actionBtnEdit: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' },
    actionBtnDelete: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>⚡ CI/CD Security Portal</h2>
          <button style={styles.logoutBtn}>Đăng xuất</button>
        </div>

        {/* Bố cục chia 2 cột: Cột trái (Form) - Cột phải (Table) */}
        <div style={styles.gridContainer}>

          {/* Cột trái: Form nhập liệu */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>{editingId ? '✏️ Cập nhật thông tin' : '➕ Thêm thành viên'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Họ và tên</label>
                <input style={styles.input} type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Ngày sinh</label>
                <input style={styles.input} type="text" name="dob" placeholder="dd/mm/yyyy" value={formData.dob} onChange={handleInputChange} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Số điện thoại</label>
                <input style={styles.input} type="text" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>

              <button type="submit" style={styles.btnSubmit}>
                {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
              </button>
              {editingId && (
                <button type="button" style={styles.btnCancel} onClick={() => { setEditingId(null); setFormData({ name: '', dob: '', email: '', phone: '' }); }}>
                  Hủy bỏ
                </button>
              )}
            </form>
          </div>

          {/* Cột phải: Bảng danh sách */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📋 Danh sách hệ thống</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Họ tên</th>
                    <th style={styles.th}>Ngày sinh</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Tùy chỉnh</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={styles.td}>{user.name}</td>
                      <td style={styles.td}>{user.dob}</td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={styles.td}>
                        <button style={styles.actionBtnEdit} onClick={() => handleEdit(user)}>Sửa</button>
                        <button style={styles.actionBtnDelete} onClick={() => handleDelete(user.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Chưa có dữ liệu nào trên hệ thống.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;