import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_movements: 0,
    total_warehouses: 0,
    low_stock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouse/dashboard/stats/');
      setStats(res.data);
    } catch (e) {
      console.error('Ошибка загрузки статистики:', e);
    }
    setLoading(false);
  };

  const statCards = [
    { title: 'Товаров', value: stats.total_products, color: '#1976d2' },
    { title: 'Движений', value: stats.total_movements, color: '#388e3c' },
    { title: 'Складов', value: stats.total_warehouses, color: '#f57c00' },
    { title: 'Низкий остаток', value: stats.low_stock, color: '#d32f2f' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Дашборд</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 3, textAlign: 'center', borderLeft: `4px solid ${card.color}` }}>
              <Typography variant="h3" sx={{ color: card.color }}>
                {card.value}
              </Typography>
              <Typography color="textSecondary">{card.title}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Статистика</Typography>
        <Typography color="textSecondary">
          Движений за неделю: {stats.movements_week || 0}
        </Typography>
      </Paper>
    </Box>
  );
}

export default Dashboard;