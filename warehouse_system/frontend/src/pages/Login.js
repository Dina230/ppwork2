import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string().required('Обязательное поле'),
  password: Yup.string().required('Обязательное поле'),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Если уже авторизован - редирект
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      console.log('Login successful:', result);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 2
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400, boxShadow: 3 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          Вход в систему
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isValid, dirty }) => (
            <Form>
              <Field name="username">
                {({ field }) => (
                  <TextField
                    {...field}
                    label="Логин"
                    fullWidth
                    margin="normal"
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    disabled={loading}
                  />
                )}
              </Field>

              <Field name="password">
                {({ field }) => (
                  <TextField
                    {...field}
                    label="Пароль"
                    type="password"
                    fullWidth
                    margin="normal"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    disabled={loading}
                  />
                )}
              </Field>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading || !isValid || !dirty}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Войти'
                )}
              </Button>
            </Form>
          )}
        </Formik>

        <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
          <Typography variant="caption" display="block" gutterBottom fontWeight="bold">
            Тестовые логины:
          </Typography>
          <Typography variant="caption" display="block">admin / admin123</Typography>
          <Typography variant="caption" display="block">manager / manager123</Typography>
          <Typography variant="caption" display="block">user / user123</Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;