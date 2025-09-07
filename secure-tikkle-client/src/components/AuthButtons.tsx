import styles from './AuthButtons.module.css';

export default function AuthButtons() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  return (
    <div className={styles.grid}>
      <a className={`${styles.btn} ${styles.kakao}`} href={`${API}/oauth2/authorization/kakao`}>카카오로 로그인</a>
      <a className={`${styles.btn} ${styles.naver}`} href={`${API}/oauth2/authorization/naver`}>네이버로 로그인</a>
      <a className={`${styles.btn} ${styles.google}`} href={`${API}/oauth2/authorization/google`}>구글로 로그인</a>
    </div>
  );
}