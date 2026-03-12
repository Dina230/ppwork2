import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { catalogAPI } from '../services/api';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [totalRows, setTotalRows] = useState(0);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [paginationModel, searchValue]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
      };
      if (searchValue) params.search = searchValue;

      const res = await catalogAPI.products.getAll(params);
      setProducts(res.data.results || []);
      setTotalRows(res.data.count || 0);
    } catch (e) {
      console.error('Ошибка загрузки товаров:', e);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await catalogAPI.products.delete(id);
      fetchProducts();
    } catch (e) {
      alert('Ошибка удаления');
    }
  };

  const columns = [
    { field: 'sku', headerName: 'Артикул', width: 120 },
    {
      field: 'name',
      headerName: 'Название',
      width: 200,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.image && (
            <img
              src={params.row.image}
              alt={params.row.name}
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          {params.value}
        </Box>
      ),
    },
    { field: 'category_name', headerName: 'Категория', width: 150 },
    { field: 'unit_name', headerName: 'Ед.', width: 80 },
    { field: 'total_stock', headerName: 'Остаток', width: 100, type: 'number' },
    { field: 'min_stock', headerName: 'Мин.', width: 80, type: 'number' },
    { field: 'price', headerName: 'Цена, ₽', width: 100, type: 'number' },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Редактировать">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/products/${params.row.id}`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Товары</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
        >
          Добавить товар
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Box component="input"
          placeholder="Поиск по названию или артикулу..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '300px',
            fontSize: '14px'
          }}
        />
      </Box>

      <DataGrid
        rows={products}
        columns={columns}
        loading={loading}
        rowCount={totalRows}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        disableRowSelectionOnClick
        sx={{ bgcolor: 'white', minHeight: 500 }}
        localeText={{
          noRowsLabel: 'Нет товаров',
          footerRowSelected: (count) => `${count} выбрано`,
        }}
      />
    </Box>
  );
}

export default Products;