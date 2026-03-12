import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Movements from './pages/Movements';
import MovementForm from './pages/MovementForm';
import Stocks from './pages/Stocks';
import AdminUsers from './pages/AdminUsers';
import AdminDictionaries from './pages/AdminDictionaries';
import AuditLogs from './pages/AuditLogs';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function PrivateRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="movements" element={<Movements />} />
            <Route path="movements/new" element={<MovementForm />} />
            <Route path="movements/:id" element={<MovementForm />} />
            <Route path="stocks" element={<Stocks />} />
            <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="admin/dictionaries" element={<AdminRoute><AdminDictionaries /></AdminRoute>} />
            <Route path="audit" element={<AuditLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;