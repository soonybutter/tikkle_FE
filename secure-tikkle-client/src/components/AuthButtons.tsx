import styles from './AuthButtons.module.css';
import { API_BASE } from '../api';
import type { MouseEvent } from 'react';

type Provider = 'kakao' | 'naver' | 'google';

const authUrl = (p: Provider) => `${API_BASE}/oauth2/authorization/${p}`;

export default function AuthButtons() {
  const go = (p: Provider) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 캡처 단계까지 포함해 다른 핸들러 차단
    e.nativeEvent.stopImmediatePropagation();
    window.location.assign(authUrl(p));
  };

  return (
    <div className={styles.grid}>
      <a className={`${styles.btn} ${styles.kakao}`} href={authUrl('kakao')} onClick={go('kakao')}>
        카카오로 로그인
      </a>
      <a className={`${styles.btn} ${styles.naver}`} href={authUrl('naver')} onClick={go('naver')}>
        네이버로 로그인
      </a>
      <a className={`${styles.btn} ${styles.google}`} href={authUrl('google')} onClick={go('google')}>
        구글로 로그인
      </a>
    </div>
  );
}