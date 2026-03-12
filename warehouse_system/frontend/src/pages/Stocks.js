import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Search as SearchIcon, Warehouse as WarehouseIcon } from '@mui/icons-material';
import { warehouseAPI, catalogAPI } from '../services/api';

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    warehouse: '',
    product: '',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [warehousesRes, productsRes] = await Promise.all([
        warehouseAPI.warehouses.getAll(),
        catalogAPI.products.getAll({ page: 1, page_size: 100 }),
      ]);
      setWarehouses(warehousesRes.data || []);
      setProducts(productsRes.data.results || productsRes.data || []);
    } catch (e) {
      console.error('Ошибка загрузки данных:', e);
    }
  };

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.warehouse) params.warehouse = filters.warehouse;
      if (filters.product) params.product = filters.product;

      const res = await warehouseAPI.stocks.getAll(params);
      let data = res.data.results || res.data || [];

      // Фильтрация по поиску
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        data = data.filter(item =>
          item.product_name?.toLowerCase().includes(searchLower) ||
          item.product_sku?.toLowerCase().includes(searchLower) ||
          item.batch_number?.toLowerCase().includes(searchLower)
        );
      }

      setStocks(data);
    } catch (e) {
      console.error('Ошибка загрузки остатков:', e);
    }
    setLoading(false);
  };

  const columns = [
    {
      field: 'product_name',
      headerName: 'Товар',
      width: 250,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.product_name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.product_sku}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'warehouse_name',
      headerName: 'Склад',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarehouseIcon fontSize="small" color="action" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'quantity',
      headerName: 'Остаток',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography
          fontWeight={600}
          color={params.value < 10 ? 'error.main' : 'inherit'}
        >
          {params.value} {params.row.unit_name || 'шт'}
        </Typography>
      ),
    },
    { field: 'batch_number', headerName: 'Партия', width: 150 },
    {
      field: 'updated_at',
      headerName: 'Обновлено',
      width: 150,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString('ru-RU') : '-',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Остатки на складах</Typography>

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Склад"
              value={filters.warehouse}
              onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
              SelectProps={{ native: true }}
              size="small"
            >
              <option value="">Все склады</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Товар"
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              SelectProps={{ native: true }}
              size="small"
            >
              <option value="">Все товары</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Поиск..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица */}
      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={stocks}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{ bgcolor: 'transparent', border: 'none', minHeight: 400 }}
          localeText={{
            noRowsLabel: 'Нет остатков',
          }}
        />
      </Paper>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" color="primary">
              {stocks.reduce((sum, s) => sum + parseFloat(s.quantity || 0), 0).toFixed(0)}
            </Typography>
            <Typography color="textSecondary">Всего единиц</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" color="warning.main">
              {stocks.filter(s => s.quantity < 10).length}
            </Typography>
            <Typography color="textSecondary">Товаров с низким остатком</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4">
              {new Set(stocks.map(s => s.warehouse)).size}
            </Typography>
            <Typography color="textSecondary">Активных складов</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Stocks;