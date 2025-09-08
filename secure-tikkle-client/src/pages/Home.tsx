import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Auth, Goals, Badges } from '../api';
import type { GoalSummaryDto, BadgeDto } from '../api';
import styles from './Home.module.css';


type NewsItem = {
  title: string;
  url: string;
  source?: string;
  publishedAt?: string;
  image?: string | null;
};

type StrMap = Record<string, unknown>;
const isObj = (v: unknown): v is StrMap => typeof v === 'object' && v !== null;
const toStr = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const notNull = <T,>(v: T | null | undefined): v is T => v != null;

type NewsApiArticle = {
  title?: unknown;
  url?: unknown;
  source?: { name?: unknown } | unknown;
  publishedAt?: unknown;
  urlToImage?: unknown;
};

type RssLikeItem = {
  title?: unknown;
  link?: unknown;
  url?: unknown;
  source?: unknown;
  publisher?: unknown;
  pubDate?: unknown;
  publishedAt?: unknown;
  thumbnail?: unknown;
  enclosure?: { url?: unknown } | unknown;
};

function mapNewsApiArticle(a: unknown): NewsItem | null {
  if (!isObj(a)) return null;
  const aa = a as NewsApiArticle;
  const title = toStr(aa.title);
  const url = toStr(aa.url);
  if (!title || !url) return null;

  const source = isObj(aa.source) ? toStr((aa.source as StrMap).name) : undefined;
  const publishedAt = toStr(aa.publishedAt);
  const image = toStr((aa as { urlToImage?: unknown }).urlToImage) ?? null;

  return { title, url, source, publishedAt, image };
}

function mapRssLikeItem(a: unknown): NewsItem | null {
  if (!isObj(a)) return null;
  const ai = a as RssLikeItem;

  const title = toStr(ai.title);
  const url = toStr(ai.link) ?? toStr(ai.url);
  if (!title || !url) return null;

  const source = toStr(ai.source) ?? toStr(ai.publisher);
  const publishedAt = toStr(ai.pubDate) ?? toStr(ai.publishedAt);

  let image: string | null = null;
  image = toStr(ai.thumbnail) ?? image;
  if (!image && isObj(ai.enclosure)) {
    image = toStr((ai.enclosure as StrMap).url) ?? null;
  }

  return { title, url, source, publishedAt, image };
}

function parseNewsResponse(json: unknown): NewsItem[] {
  if (isObj(json) && Array.isArray((json as StrMap).articles)) {
    return ((json as StrMap).articles as unknown[]).map(mapNewsApiArticle).filter(notNull).slice(0, 12);
  }
  if (isObj(json) && Array.isArray((json as StrMap).items)) {
    return ((json as StrMap).items as unknown[]).map(mapRssLikeItem).filter(notNull).slice(0, 12);
  }
  if (Array.isArray(json)) {
    return (json as unknown[]).map(mapRssLikeItem).filter(notNull).slice(0, 12);
  }
  return [];
}

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null); // ← 로그인 여부(리다이렉트 금지)
  const [loading, setLoading] = useState(true);               // ← 데이터 로딩(뉴스/개인화)
  const [goals, setGoals] = useState<GoalSummaryDto[]>([]);
  const [badges, setBadges] = useState<BadgeDto[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  const earnedBadges = useMemo(() => badges.filter((b) => b.earned === true), [badges]);

  const badgeRailRef = useRef<HTMLDivElement>(null);
  const scrollBadges = (dir: 'left' | 'right') => {
    const rail = badgeRailRef.current;
    if (!rail) return;
    const first = rail.querySelector(`.${styles.badgeItem}`) as HTMLElement | null;
    const gap =
      parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || '16') || 16;
    const step = (first?.offsetWidth ?? rail.clientWidth / 4) + gap;
    rail.scrollBy({ left: dir === 'left' ? -step * 2 : step * 2, behavior: 'smooth' });
  };

  // 1) 로그인 여부만 판단 (리다이렉트 절대 금지)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await Auth.me();
        if (mounted) setAuthed(!!me?.authenticated);
      } catch {
        if (mounted) setAuthed(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 2) 데이터 로딩 (뉴스는 항상, 목표/배지는 authed일 때만)
  useEffect(() => {
    let mounted = true;
    if (authed === null) return; // 로그인 여부 모를 땐 대기

    (async () => {
      try {
        if (authed) {
          const [g, b] = await Promise.all([Goals.list(), Badges.list()]);
          if (!mounted) return;
          setGoals(g);
          setBadges(b);
        } else {
          setGoals([]); setBadges([]);
        }

        try {
          const r = await fetch(NEWS_URL, { credentials: 'omit' });
          const j: unknown = await r.json();
          if (!mounted) return;
          setNews(parseNewsResponse(j));
        } catch {
          if (mounted) setNews([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [authed]);

  const today = useMemo(() => new Date().toLocaleDateString('ko-KR', { dateStyle: 'long' }), []);
  const sums = useMemo(() => {
    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
    const done = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
    return { totalTarget, totalCurrent, done, count: goals.length };
  }, [goals]);

  const tips = [
    '커피값 대신 저축통장으로 차곡차곡  ☕→💰',
    '장보기 전 장바구니 목록 작성! 📝',
    '택시 대신 버스/지하철 한 번만 더 🚇',
    '구독 서비스 점검하기 🔍',
    '필요 없는 쇼핑앱 알림 끄기 🔕',
    '주 1회만 외식, 나머진 집밥 챙겨보기 🍚',
    '배달비 아끼기 ! 포장으로 해봐요🚶🏻‍♀️',
    '일주일 ‘무지출 데이’ 1회 도전 🚫',
    '도보 15분 이내는 걸어서 이동 🚶',
    '전기요금 피크시간대 사용 줄이기 ⬇️',
    '카드 포인트 · 마일리지 즉시 전환/소액이체 🎯',
    '현금영수증 · 적립 스탬프 꾸준히 모으기 🧾',
    '아아 생각날 때, 캡슐커피로 대체 해보기 ☕',
    '장바구니 24시간 룰(내일도 원하면 결제) ⏳',
    '앱 푸시(쇼핑/딜) 알림 OFF 🔕',
    '무료체험 시작 해지 알람 등록 ⏰',
    '새 옷 사기 전 옷장 겹치는지 확인 👚',
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];

  // 뉴스 API
  const NEWS_URL = import.meta.env.VITE_NEWS_URL ?? '/api/news';
  // 5분 캐시 (호출 제한/지연 대비)
  const NEWS_CACHE_KEY = 'home_news_v1';
  const NEWS_TTL_MS = 5 * 60 * 1000;

  // 뉴스 스크롤 효과
  const newsRailRef = useRef<HTMLDivElement>(null);
  const [newsPaused, setNewsPaused] = useState(false);


  function normalizeNews(items: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    return items
      .filter(n => {
        const key = n.url;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) =>
        new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
      );
  }

  function formatAgo(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
    return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
  }

  // 자동스크롤 효과 
  useEffect(() => {
    const rail = newsRailRef.current;
    if (!rail || news.length === 0) return;

    const stepCalc = () => {
      const first = rail.querySelector(`.${styles.newsCard}`) as HTMLElement | null;
      const gap =
        parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || '10') || 10;
      return (first?.offsetWidth ?? 260) + gap;
    };

    const intervalId = window.setInterval(() => {
      if (newsPaused) return;
      const step = stepCalc();
      const max = rail.scrollWidth - rail.clientWidth - 1;

      if (rail.scrollLeft >= max) {
        rail.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        rail.scrollBy({ left: step, behavior: 'smooth' });
    }
  }, 3000);

    return () => window.clearInterval(intervalId);
  }, [newsPaused, news.length]);

  useEffect(() => {
    let mounted = true;
    if (authed === null) return;

    (async () => {
      try {
        // 로그인 데이터
        if (authed) {
          const [g, b] = await Promise.all([Goals.list(), Badges.list()]);
          if (!mounted) return;
          setGoals(g);
          setBadges(b);
        } else {
          setGoals([]); setBadges([]);
        }

        //  뉴스: 캐시 → 네트워크 순서로
        try {
          const raw = sessionStorage.getItem(NEWS_CACHE_KEY);
          if (raw) {
            const cached = JSON.parse(raw) as { ts: number; data: NewsItem[] };
            if (Date.now() - cached.ts < NEWS_TTL_MS) {
              if (mounted) setNews(cached.data);
            }
          }

          if (!raw || Date.now() - (JSON.parse(raw)?.ts ?? 0) >= NEWS_TTL_MS) {
            const ac = new AbortController();
            try {
              const r = await fetch(NEWS_URL, { credentials: 'omit', signal: ac.signal });
              const j: unknown = await r.json();
              if (!mounted) return;
              const items = normalizeNews(parseNewsResponse(j));
              setNews(items);
              sessionStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: items }));
            } catch {
              if (mounted) setNews(prev => prev.length ? prev : []); // 실패 시 캐시/이전값 유지
            }
          }
        } catch {
          if (mounted) setNews([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [authed]);

  // authed === null인 짧은 동안만 스켈레톤/대기, 비로그인으로 확정되면 바로 인트로 렌더
  if (authed === null) return <main className="container page">로딩 중…</main>;

  return (
    <main className={`container ${styles.page}`}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.date}>{today}</div>

          {/* 비로그인 인트로 카피 */}
          {!authed ? (
            <>
              <h1 className={styles.title}>작은 절약이 쌓여 큰 목표가 됩니다.</h1>
              <p className={styles.tip}>💡 오늘의 절약 팁: {tip}</p>
              <div className={styles.ctaRow}>
                <Link to="/login" className={styles.cta}>소셜 로그인으로 시작하기</Link>
              </div>
            </>
          ) : (
            // 로그인된 경우 개인화 요약
            <>
              <h1 className={styles.title}>오늘의 티끌을 모아볼까요? 🐣</h1>
              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>총 모은 금액</div>
                  <div className={styles.statValue}>{sums.totalCurrent.toLocaleString()}원</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>전체 목표</div>
                  <div className={styles.statValue}>{sums.count}개</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>완료한 목표</div>
                  <div className={styles.statValue}>{sums.done}개</div>
                </div>
              </div>
              <p className={styles.tip}>💡 오늘의 절약 팁: {tip}</p>
              <div className={styles.ctaRow}>
                <Link to="/goals/new" className={styles.cta}>+ 새 목표 만들기</Link>
              </div>
            </>
          )}
        </div>
        <div className={styles.heroMascot} aria-hidden>💸</div>
      </section>

      {/* News (항상 노출 가능) */}
      <section className={styles.section} >
        <h2 className={styles.sectionTitle}>오늘의 경제 뉴스</h2>
        <div className={styles.newsSection}>
          {loading && news.length === 0 ? (
          <div className={styles.empty}>불러오는 중…</div>
        ) : news.length === 0 ? (
          <div className={styles.empty}>가져올 뉴스가 없어요. 잠시 후 다시 시도해 주세요.</div>
        ) : (
          <div
            ref={newsRailRef}
            className={styles.newsRail}
            onMouseEnter={() => setNewsPaused(true)}
            onMouseLeave={() => setNewsPaused(false)}
            onFocus={() => setNewsPaused(true)}
            onBlur={() => setNewsPaused(false)}
          >
            {news.map((n, i) => (
              <a key={i} className={styles.newsCard} href={n.url} target="_blank" rel="noreferrer">
                <div className={styles.newsThumb}>
                  {n.image ? <img src={n.image} alt="" /> : <span className={styles.newsEmoji}>📰</span>}
                </div>
                <div className={styles.newsMeta}>
                  <div className={styles.newsSource}>
                      {n.source ?? 'News'}
                      {n.publishedAt && <span className={styles.newsTime}> · {formatAgo(n.publishedAt)}</span>}
                  </div>
                  <div className={styles.newsTitle}>{n.title}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        </div>
        
      </section>

      {/* Goals & Badges: 로그인된 경우에만 노출 */}
      {authed && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>내 목표 한눈에 보기</h2>
            <div className={styles.goalGrid}>
              {goals.map((g) => {
                const p = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <Link key={g.id} to={`/goals/${g.id}`} className={styles.goalCard}>
                    <div className={styles.goalTop}>
                      <span className={styles.goalEmoji}>📌</span>
                      <div className={styles.goalTitle}>{g.title}</div>
                    </div>
                    <div className={styles.goalAmounts}>
                      <b>{g.currentAmount.toLocaleString()}원</b>
                      <span> / {g.targetAmount.toLocaleString()}원</span>
                    </div>
                    <div className={styles.progressTrack} aria-label="진행률">
                      <div className={styles.progressFill} style={{ width: `${p}%` }} aria-hidden />
                    </div>
                    <div className={styles.goalProgressText}>진행률 {p}%</div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.badgeHead}>
              <h2 className={styles.sectionTitle}>나의 배지</h2>
              <Link to="/badges" className={styles.linkBtn}>배지 전체 보기 →</Link>
            </div>

            {earnedBadges.length === 0 ? (
              <div className={styles.empty}>아직 획득한 배지가 없어요. 첫 배지를 노려보세요! 🎯</div>
            ) : (
              <div
                className={styles.badgeCarousel}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') scrollBadges('left');
                  if (e.key === 'ArrowRight') scrollBadges('right');
                }}
              >
                <button type="button" className={`${styles.arrow} ${styles.left}`} aria-label="왼쪽으로" onClick={() => scrollBadges('left')}>‹</button>
                <div ref={badgeRailRef} className={styles.badgeRail}>
                  {earnedBadges.map((b) => (
                    <div key={b.code} className={styles.badgeItem} title={b.title} tabIndex={0} aria-label={`${b.title} 획득`}>
                      <div className={styles.badgeFlip}>
                        <div className={styles.badge3d}>
                          <div className={`${styles.badgeFace} ${styles.front}`}>
                            <div className={styles.badgeCircle}>
                              <img src="/badge/cuteStar.png" alt="" className={styles.badgeStar} loading="lazy" />
                            </div>
                          </div>
                          <div className={`${styles.badgeFace} ${styles.back}`}>
                            <div className={styles.badgeCircle}>
                              <div className={styles.badgeBackEmoji} aria-hidden><div>🏅</div></div>
                              <div className={styles.badgeBackText}>
                                {b.earnedAt && <div className={styles.badgeBackMeta}>획득일 {new Date(b.earnedAt).toLocaleDateString('ko-KR')}</div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.badgeLabel}>{b.title}</div>
                    </div>
                  ))}
                </div>
                <button type="button" className={`${styles.arrow} ${styles.right}`} aria-label="오른쪽으로" onClick={() => scrollBadges('right')}>›</button>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}