import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem,
  ListItemIcon, ListItemText, ListItemButton, Avatar, Menu, MenuItem, Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Inventory as ProductsIcon,
  SwapHoriz as MovementsIcon, Storage as StocksIcon,
  AdminPanelSettings as AdminIcon, History as AuditIcon,
  Logout as LogoutIcon, Menu as MenuIcon, Notifications as NotificationsIcon
} from '@mui/icons-material';
import { auditAPI } from '../services/api';

const drawerWidth = 240;

function Layout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Товары', icon: <ProductsIcon />, path: '/products' },
    { text: 'Движения', icon: <MovementsIcon />, path: '/movements' },
    { text: 'Остатки', icon: <StocksIcon />, path: '/stocks' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ text: 'Админка', icon: <AdminIcon />, path: '/admin/users' });
  }

  menuItems.push({ text: 'Аудит', icon: <AuditIcon />, path: '/audit' });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  React.useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const res = await auditAPI.notifications.unreadCount();
        setNotifCount(res.data.count);
      } catch (e) {}
    };
    fetchNotifCount();
  }, []);

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap>Склад</Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 2, display: { sm: 'none' } }} onClick={() => setMobileOpen(!mobileOpen)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Система складского учёта
          </Typography>

          <IconButton color="inherit">
            <Badge badgeContent={notifCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}>{user?.username[0]}</Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>Профиль</MenuItem>
            <MenuItem onClick={handleLogout}><LogoutIcon sx={{ mr: 1 }} /> Выход</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}

export default Layout;