import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Chip, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
  CheckCircle as ApproveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { warehouseAPI } from '../services/api';

const statusConfig = {
  draft: { label: 'Черновик', color: 'default' },
  pending: { label: 'На согласовании', color: 'warning' },
  approved: { label: 'Проведен', color: 'success' },
  cancelled: { label: 'Отменен', color: 'error' },
};

function Movements() {
  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await warehouseAPI.movements.getAll();
      setMovements(res.data.results || []);
    } catch (e) {
      console.error('Ошибка загрузки движений:', e);
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await warehouseAPI.movements.approve(id);
      fetchMovements();
    } catch (e) {
      alert('Ошибка утверждения');
    }
    setAnchorEl(null);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Отменить движение?')) return;
    try {
      await warehouseAPI.movements.cancel(id);
      fetchMovements();
    } catch (e) {
      alert('Ошибка отмены');
    }
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const columns = [
    { field: 'id', headerName: '№', width: 80 },
    { field: 'type_name', headerName: 'Тип', width: 150 },
    { field: 'warehouse_name', headerName: 'Склад', width: 150 },
    { field: 'counterparty_name', headerName: 'Контрагент', width: 150 },
    {
      field: 'status',
      headerName: 'Статус',
      width: 140,
      renderCell: (params) => {
        const config = statusConfig[params.value] || statusConfig.draft;
        return <Chip label={config.label} color={config.color} size="small" />;
      }
    },
    {
      field: 'date',
      headerName: 'Дата',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('ru-RU'),
    },
    { field: 'total_amount', headerName: 'Сумма', width: 120, type: 'number' },
    { field: 'created_by_name', headerName: 'Создал', width: 150 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Действия">
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, params.row)}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Движения товаров</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/movements/new')}
        >
          Создать движение
        </Button>
      </Box>

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedRow) navigate(`/movements/${selectedRow.id}`);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" /> Просмотр
        </MenuItem>
        {selectedRow?.status === 'pending' && (
          <MenuItem onClick={() => handleApprove(selectedRow.id)} sx={{ color: 'success.main' }}>
            <ApproveIcon sx={{ mr: 1 }} fontSize="small" /> Утвердить
          </MenuItem>
        )}
        {selectedRow?.status === 'draft' && (
          <MenuItem onClick={() => {
            if (selectedRow) navigate(`/movements/${selectedRow.id}`);
            handleMenuClose();
          }}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" /> Редактировать
          </MenuItem>
        )}
        {selectedRow?.status !== 'cancelled' && (
          <MenuItem onClick={() => handleCancel(selectedRow?.id)} sx={{ color: 'error.main' }}>
            <CancelIcon sx={{ mr: 1 }} fontSize="small" /> Отменить
          </MenuItem>
        )}
      </Menu>

      <DataGrid
        rows={movements}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        sx={{ bgcolor: 'white', minHeight: 500 }}
        localeText={{
          noRowsLabel: 'Нет движений',
        }}
      />
    </Box>
  );
}

export default Movements;