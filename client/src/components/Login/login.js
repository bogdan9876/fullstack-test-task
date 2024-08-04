import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ErrorValid from '../ErrorValid/errorValid';
import './login.css';

const API_URL = process.env.REACT_APP_API_URL;

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
      const response = await axios.post(`${API_URL}/users/login`, values);
      const { token } = response.data;
      if (token) {
        localStorage.setItem('accessToken', token);
        navigate('/');
      } else {
        alert('Login failed. No token received.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className='login'>Login</div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        <Form className="input-container">
          <p className='text4'>Email</p>
          <Field className="login-input" type="text" name="email" placeholder="Your email" />
          <ErrorMessage name="email" component={ErrorValid} />
          <p className='text1'>Password</p>
          <Field className="login-input" type="password" name="password" placeholder="*********" />
          <ErrorMessage name="password" component={ErrorValid} />
          <button className="login-button" type="submit">Login</button>
        </Form>
      </Formik>
      <p className='login-text'>Not a member? <span onClick={() => navigate('/register')}>Register</span></p>
    </div>
  );
};

export default Login;