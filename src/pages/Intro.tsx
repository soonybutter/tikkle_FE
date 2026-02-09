import { useEffect, useRef } from 'react';
import styles from './Intro.module.css';
import AuthButtons from '../components/AuthButtons';

export default function Intro() {
  const glassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = document.querySelector(`#features.${styles.features}`);
    if (!sec) return;
    const io = new IntersectionObserver((es) => {
      es.forEach(en => en.isIntersecting && en.target.classList.add(styles.revealed));
    }, { threshold: 0.05 });
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll(`.${styles.feature}`);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add(styles.in); // ▶ 애니메이션 트리거
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // 3D-tilt (마우스만)
  const handleTilt = (e: React.MouseEvent) => {
    const el = glassRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${y * 6}deg) rotateY(${x * -6}deg) translateZ(0)`;
  };
  const resetTilt = () => {
    const el = glassRef.current;
    if (!el) return;
    el.style.transform = `rotateX(0deg) rotateY(0deg)`;
  };

  // 스크롤 리빌(IntersectionObserver)
  useEffect(() => {
    const els = document.querySelectorAll(`.${styles.reveal}`);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.classList.add(styles.revealed);
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>
            작은 절약이 쌓여
            <br className={styles.brMobile} />
            <span className={styles.accent}>큰 목표</span>가 됩니다.
          </h1>

          <div
            className={styles.glassWrap}
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
            aria-hidden
          >
            <div ref={glassRef} className={styles.glassCard}>
              <div className={styles.glassHead}>유럽 여행 저축</div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: '62%' }} />
              </div>
              <div className={styles.progressText}>₩620,000 / ₩1,000,000 (62%)</div>
              <ul className={styles.miniList}>
                <li>☕ 아아 참음 +₩4,500</li>
                <li>🚇 택시 대신 지하철 +₩2,100</li>
                <li>🛍️ 충동구매 참음 +₩12,000</li>
              </ul>
            </div>
          </div>

          <a href="#login" className={styles.ctaLarge}>소셜 로그인으로 시작하기</a>
        </div>
        {/* 배경 블롭 */}
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </section>

      {/* Features */}
    <section id="features" className={styles.features}>
    <div className={styles.featuresInner}>
        <div className={styles.feature}>
        <div className={styles.fIcon}><span className={styles.fEmoji} aria-hidden>🎮</span></div>
        <h3>재미</h3>
        <p>배지·랭킹으로 재미있게 꾸준함을 만듭니다.</p>
        </div>

        <div className={styles.feature}>
        <div className={styles.fIcon}><span className={styles.fEmoji} aria-hidden>⚡️</span></div>
        <h3>초간단 입력</h3>
        <p>두 줄이면 기록 완료. 지연 없이 바로 저장.</p>
        </div>

        <div className={styles.feature}>
        <div className={styles.fIcon}><span className={styles.fEmoji} aria-hidden>🤝</span></div>
        <h3>친구와 함께</h3>
        <p>서로 응원하고 경쟁하며 목표에 가까워져요.</p>
        </div>
    </div>
    </section>

      {/* Value band */}
      <section className={`${styles.band} ${styles.reveal}`}>
        <div className={styles.bandInner}>
          <h2>돈 관리, 어렵지 않게.</h2>
          <p>불필요한 요소를 덜고 핵심만 남겼습니다. </p> 
          <p>보기 쉽고 쓰기 쉬운 경험을 제공합니다.</p>
        </div>
      </section>

      {/* 로그인 섹션 */}
      <section id="login" className={`${styles.loginSection} ${styles.reveal}`} aria-labelledby="loginTitle">
        <div className={styles.loginCard}>
          <h2 id="loginTitle" className={styles.loginTitle}>시작해볼까요?</h2>
          <p className={styles.loginSub}>아래 소셜 계정으로 로그인하세요.</p>
          <AuthButtons />
        </div>
      </section>
    </main>
  );
}