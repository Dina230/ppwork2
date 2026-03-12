import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Grid } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { warehouseAPI, catalogAPI } from '../services/api';

function MovementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [counterparties, setCounterparties] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, warehousesRes, counterpartiesRes, productsRes] = await Promise.all([
          warehouseAPI.movementTypes.getAll(),
          warehouseAPI.warehouses.getAll(),
          warehouseAPI.counterparties.getAll(),
          catalogAPI.products.getAll({ page: 1, page_size: 100 }),
        ]);
        setTypes(typesRes.data);
        setWarehouses(warehousesRes.data);
        setCounterparties(counterpartiesRes.data);
        setProducts(productsRes.data.results || productsRes.data);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (id) await warehouseAPI.movements.update(id, values);
      else await warehouseAPI.movements.create(values);
      navigate('/movements');
    } catch (e) { alert('Ошибка сохранения'); }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>{id ? 'Редактирование' : 'Создание'} движения</Typography>
      <Formik initialValues={{ type: '', warehouse: '', counterparty: '', status: 'draft', date: new Date().toISOString().split('T')[0], comment: '' }} onSubmit={handleSubmit}>
        {() => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Field name="type">{({ field }) => (
                  <TextField {...field} select label="Тип" fullWidth SelectProps={{ native: true }}>
                    <option value="">Выберите</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </TextField>
                )}</Field>
              </Grid>
              <Grid item xs={6}>
                <Field name="warehouse">{({ field }) => (
                  <TextField {...field} select label="Склад" fullWidth SelectProps={{ native: true }}>
                    <option value="">Выберите</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </TextField>
                )}</Field>
              </Grid>
              <Grid item xs={6}>
                <Field name="counterparty">{({ field }) => (
                  <TextField {...field} select label="Контрагент" fullWidth SelectProps={{ native: true }}>
                    <option value="">Выберите</option>
                    {counterparties.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </TextField>
                )}</Field>
              </Grid>
              <Grid item xs={6}>
                <Field name="date">{({ field }) => <TextField {...field} label="Дата" type="date" fullWidth InputLabelProps={{ shrink: true }} />}</Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="comment">{({ field }) => <TextField {...field} label="Комментарий" multiline rows={3} fullWidth />}</Field>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained">Сохранить</Button>
              <Button onClick={() => navigate('/movements')} sx={{ ml: 2 }}>Отмена</Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
}

export default MovementForm;