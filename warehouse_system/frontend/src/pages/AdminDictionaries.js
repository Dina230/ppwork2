import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText } from '@mui/material';
import { catalogAPI } from '../services/api';

function AdminDictionaries() {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, units] = await Promise.all([
          catalogAPI.categories.getAll(),
          catalogAPI.units.getAll(),
        ]);
        setCategories(cats.data);
        setUnits(units.data);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Справочники</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Категории</Typography>
            <List>
              {categories.map(c => (
                <ListItem key={c.id}>
                  <ListItemText primary={c.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Единицы измерения</Typography>
            <List>
              {units.map(u => (
                <ListItem key={u.id}>
                  <ListItemText primary={`${u.name} (${u.code})`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDictionaries;