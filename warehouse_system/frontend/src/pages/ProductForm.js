import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Grid } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { catalogAPI } from '../services/api';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [initialValues, setInitialValues] = useState({
    name: '', sku: '', category: '', unit: '', min_stock: 0, price: 0, description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, units] = await Promise.all([
          catalogAPI.categories.getAll(),
          catalogAPI.units.getAll(),
        ]);
        setCategories(cats.data);
        setUnits(units.data);

        if (id) {
          const res = await catalogAPI.products.getById(id);
          setInitialValues({
            name: res.data.name, sku: res.data.sku, category: res.data.category,
            unit: res.data.unit, min_stock: res.data.min_stock, price: res.data.price,
            description: res.data.description,
          });
        }
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (values) => {
    try {
      if (id) await catalogAPI.products.update(id, values);
      else await catalogAPI.products.create(values);
      navigate('/products');
    } catch (e) { alert('Ошибка сохранения'); }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>{id ? 'Редактирование' : 'Создание'} товара</Typography>

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {() => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Field name="name">{({ field }) => <TextField {...field} label="Название" fullWidth />}</Field>
              </Grid>
              <Grid item xs={6}>
                <Field name="sku">{({ field }) => <TextField {...field} label="Артикул" fullWidth />}</Field>
              </Grid>
              <Grid item xs={6}>
                <Field name="category">{({ field }) => (
                  <TextField {...field} select label="Категория" fullWidth SelectProps={{ native: true }}>
                    <option value="">Выберите</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </TextField>
                )}</Field>
              </Grid>
              <Grid item xs={6}>
                <Field name="unit">{({ field }) => (
                  <TextField {...field} select label="Ед. измерения" fullWidth SelectProps={{ native: true }}>
                    <option value="">Выберите</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </TextField>
                )}</Field>
              </Grid>
              <Grid item xs={6}>
                <Field name="min_stock">{({ field }) => <TextField {...field} label="Мин. остаток" type="number" fullWidth />}</Field>
              </Grid>
              <Grid item xs={6}>
                <Field name="price">{({ field }) => <TextField {...field} label="Цена" type="number" fullWidth />}</Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="description">{({ field }) => <TextField {...field} label="Описание" multiline rows={3} fullWidth />}</Field>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained">Сохранить</Button>
              <Button onClick={() => navigate('/products')} sx={{ ml: 2 }}>Отмена</Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
}

export default ProductForm;