import React from 'react';
import styles from './errorValid.module.css';

const ErrorValid = ({ children }) => (
  <div className={styles.errorMain}>{children}</div>
);

export default ErrorValid;