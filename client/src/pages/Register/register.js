import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ErrorValid from '../../components/ErrorValid/errorValid';
import { registerUser } from '../../services/registerApi';
import styles from './register.module.css';

const Register = () => {
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    email: '',
    password: '',
    retypePassword: '',
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(10, 'Password must be at least 10 characters'),
    retypePassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const handleRegister = async (values) => {
    try {
      await registerUser(values);
      localStorage.setItem('registeredUser', values.email);
      localStorage.setItem('registeredPassword', values.password);
      navigate('/login');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'An error occurred during registration');
    }
  };

  return (
    <>
      <div className={styles.registerTitle}>Register</div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleRegister}
      >
        <Form className={styles.registerFormContainer}>
          <p className={styles.usernameLabel}>Username</p>
          <div className={styles.fieldContainer}>
            <Field className={styles.registerInput} type="text" name="username" placeholder="Username" />
            <ErrorMessage name="username" component={ErrorValid} />
          </div>
          <p className={styles.emailLabel}>Email</p>
          <div className={styles.fieldContainer}>
            <Field className={styles.registerInput} type="text" name="email" placeholder="Email" />
            <ErrorMessage name="email" component={ErrorValid} />
          </div>
          <p className={styles.passwordLabel}>Password</p>
          <div className={styles.fieldContainer}>
            <Field className={styles.registerInput} type="password" name="password" placeholder="*********" />
            <ErrorMessage name="password" component={ErrorValid} />
          </div>
          <p className={styles.retypePasswordLabel}>Retype password</p>
          <div className={styles.fieldContainer}>
            <Field className={styles.registerInput} type="password" name="retypePassword" placeholder="*********" />
            <ErrorMessage name="retypePassword" component={ErrorValid} />
          </div>
          <button className={styles.registerButton} type="submit">Register</button>
        </Form>
      </Formik>
      <p className={styles.registerText}>Already a member? <span onClick={() => navigate('/login')} className={styles.registerTextLink}>Login</span></p>
    </>
  );
};

export default Register;
