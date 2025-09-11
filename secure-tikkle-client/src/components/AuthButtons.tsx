import styles from './AuthButtons.module.css';
import { API_BASE } from '../api';

const authUrl = (p: 'kakao' | 'naver' | 'google') =>
  `${API_BASE}/oauth2/authorization/${p}`;

export default function AuthButtons() {
  return (
    <div className={styles.grid}>
      <a className={`${styles.btn} ${styles.kakao}`} href={authUrl('kakao')}>카카오로 로그인</a>
      <a className={`${styles.btn} ${styles.naver}`} href={authUrl('naver')}>네이버로 로그인</a>
      <a className={`${styles.btn} ${styles.google}`} href={authUrl('google')}>구글로 로그인</a>
    </div>
  );
}