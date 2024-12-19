import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { loginUser, googleLoginRequest } from '../../services/loginApi';
import ErrorValid from '../../components/ErrorValid/errorValid';
import { useGoogleLogin } from '@react-oauth/google';
import styles from './login.module.css';

const Login = () => {
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleLogin = async (values) => {
    try {
      const data = await loginUser(values);
      if (data.token) {
        localStorage.setItem('accessToken', data.token);
        navigate('/');
      } else {
        alert('Login failed. No token received.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      alert(error.message);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const data = await googleLoginRequest(tokenResponse.access_token);
      localStorage.setItem('accessToken', data.token);
      navigate('/');
    },
    onError: () => {
      alert('Google Login Failed');
    },
  });

  const handleGoogleLogin = async () => {
    try {
      googleLogin();
    } catch (error) {
      console.error('Google Login Error:', error.message);
      alert('Google Login Failed');
    }
  };

  return (
      <div className={styles.loginWrapper}>
        <div className={styles.login}>Login</div>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          <Form className={styles.formGroup}>
            <p className={styles.emailLabel}>Email</p>
            <Field className={styles.inputField} type="text" name="email" placeholder="Your email" />
            <ErrorMessage name="email" component={ErrorValid} />
            <p className={styles.passwordLabel}>Password</p>
            <Field className={styles.inputField} type="password" name="password" placeholder="*********" />
            <ErrorMessage name="password" component={ErrorValid} />
            <button className={styles.submitButton} type="submit">Login</button>
          </Form>
        </Formik>
        <div className={styles.or}>or</div>
        <button
          className={styles.googleLoginButton}
          onClick={handleGoogleLogin}
        >
          Sign in with Google 
        </button>
        <div className={styles.registerLink}>Not a member? <span onClick={() => navigate('/register')}>Register</span></div>
      </div>
  );
};

export default Login;
