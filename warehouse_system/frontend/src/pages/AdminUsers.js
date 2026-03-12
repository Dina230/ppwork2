import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { usersAPI } from '../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('user');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data.results || []);
    } catch (e) {
      console.error('Ошибка загрузки пользователей:', e);
    }
  };

  const handleChangeRole = async () => {
    try {
      await usersAPI.changeRole(selectedUser.id, role);
      setOpen(false);
      fetchUsers();
    } catch (e) {
      alert('Ошибка изменения роли');
    }
  };

  const columns = [
    { field: 'username', headerName: 'Логин', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Роль', width: 120 },
    { field: 'is_active', headerName: 'Активен', width: 100 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 150,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedUser(params.row);
            setRole(params.row.role);
            setOpen(true);
          }}
        >
          Изменить роль
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Управление пользователями</Typography>

      <DataGrid
        rows={users}
        columns={columns}
        disableRowSelectionOnClick
        sx={{ bgcolor: 'white', minHeight: 400 }}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Изменить роль</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ mt: 1, minWidth: 200 }}
          >
            <option value="admin">Администратор</option>
            <option value="manager">Менеджер</option>
            <option value="user">Пользователь</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleChangeRole} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminUsers;