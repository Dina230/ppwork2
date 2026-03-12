import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { auditAPI } from '../services/api';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditAPI.logs.getAll();
      setLogs(res.data.results || []);
    } catch (e) {
      console.error('Ошибка загрузки аудита:', e);
    }
    setLoading(false);
  };

  const actionColors = {
    'CREATE': 'success',
    'UPDATE': 'info',
    'DELETE': 'error',
    'APPROVE': 'success',
    'CANCEL': 'warning',
  };

  const columns = [
    {
      field: 'timestamp',
      headerName: 'Время',
      width: 180,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleString('ru-RU') : '-',
    },
    { field: 'user_name', headerName: 'Пользователь', width: 150 },
    {
      field: 'action',
      headerName: 'Действие',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={actionColors[params.value] || 'default'}
          size="small"
        />
      ),
    },
    { field: 'model_name', headerName: 'Модель', width: 150 },
    { field: 'object_id', headerName: 'ID объекта', width: 100 },
    {
      field: 'changes',
      headerName: 'Изменения',
      width: 200,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {JSON.stringify(params.value).slice(0, 100)}...
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Журнал аудита</Typography>

      <DataGrid
        rows={logs}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        sx={{ bgcolor: 'white', minHeight: 500 }}
        localeText={{
          noRowsLabel: 'Нет записей в журнале',
        }}
      />
    </Box>
  );
}

export default AuditLogs;