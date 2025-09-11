import styles from './AuthButtons.module.css';
import { API_BASE } from '../api';

const u = (p: 'kakao'|'naver'|'google') => `${API_BASE}/oauth2/authorization/${p}`;

export default function AuthButtons() {
  // ⚠️ onClick으로 location.assign 하지 말고, <a href="절대주소"> 만 사용
  return (
    <div className={styles.grid}>
      <a className={`${styles.btn} ${styles.kakao}`} href={u('kakao')}>카카오로 로그인</a>
      <a className={`${styles.btn} ${styles.naver}`} href={u('naver')}>네이버로 로그인</a>
      <a className={`${styles.btn} ${styles.google}`} href={u('google')}>구글로 로그인</a>
    </div>
  );
}