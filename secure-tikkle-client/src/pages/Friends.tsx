import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Rank } from '../api';
import styles from './Friends.module.css';

type RankGroup = { id: number; name: string };
type LeaderRow = { userId: number; name: string; total: number; last30d: number };
type GroupDetailRes = { id: number; members: LeaderRow[] };
type InviteLink = { code: string; expiresAt: string; maxUses?: number; usedCount?: number };

export default function Friends() {
  // URL로 들어온 /groups/:id 도 지원
  const { id } = useParams();
  const [groups, setGroups] = useState<RankGroup[]>([]);
  const [selected, setSelected] = useState<number | null>(id ? Number(id) : null);

  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const [invite, setInvite] = useState<InviteLink | null>(null);

  // 내 그룹 목록
  useEffect(() => {
    (async () => {
      const gs = await Rank.myGroups();
      setGroups(gs);
      // 최초 진입 시 선택
      if (!selected && gs.length) setSelected(gs[0].id);
    })();
  }, []);

  // 선택된 그룹 상세(리더보드)
  useEffect(() => {
    if (!selected) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res: GroupDetailRes = await Rank.groupDetail(selected);
        if (!mounted) return;
        // 서버는 members만 내려줌. 이미 합계/30일 제공하면 그대로 사용
        setLeaders(
          [...res.members].sort((a, b) => b.total - a.total)
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selected]);

  const selectedGroup = useMemo(
    () => groups.find(g => g.id === selected) ?? null,
    [groups, selected]
  );

  const inviteUrl = useMemo(
    () => (invite?.code ? `${window.location.origin}/join/${invite.code}` : ''),
    [invite?.code]
  );

  // Kakao 공유 (없으면 클립보드 복사로 폴백)
   async function shareInvite() {
    if (!inviteUrl) return;
    const key = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined;

    // SDK 로딩
    if (key && !window.Kakao) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Kakao SDK load failed'));
        document.head.appendChild(s);
      }).catch(() => {});
    }
     try {
      const Kakao = window.Kakao;
      if (key && Kakao && !Kakao.isInitialized?.()) Kakao.init(key);

      if (Kakao?.Share?.sendDefault) {
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${selectedGroup?.name ?? '랭킹 그룹'} 초대`,
            description: '절약 랭킹에 합류해보세요!',
            imageUrl: 'https://dummyimage.com/600x315/ffffff/111111&text=Tikkle+Rank',
            link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl }
          },
          buttons: [{ title: '참여하기', link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl } }]
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        alert('카카오 SDK 미사용: 초대 링크를 클립보드에 복사했어요!');
      }
    } catch {
      await navigator.clipboard.writeText(inviteUrl);
      alert('공유 중 문제가 있어 링크를 복사했어요!');
    }
  }

  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={styles.title}>친구 · 랭킹</h1>
      </header>

      <section className={styles.layout}>
        {/* 좌: 그룹 목록 / 생성 / 코드참여 */}
        <aside className={styles.sidebar}>
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>내 그룹</h3>
            <div className={styles.groupList}>
              {groups.map(g => (
                <button
                  key={g.id}
                  className={`${styles.groupItem} ${selected === g.id ? styles.active : ''}`}
                  onClick={() => setSelected(g.id)}
                >
                  {g.name}
                </button>
              ))}
              {!groups.length && <div className={styles.empty}>아직 그룹이 없어요.</div>}
            </div>
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockTitle}>+ 새 그룹</h3>
            <div className={styles.row}>
              <input
                className={styles.input}
                placeholder="그룹명"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
              />
              <button
                className={styles.btn}
                onClick={async () => {
                  if (!newGroupName.trim()) return;
                  const g = await Rank.createGroup(newGroupName.trim());
                  setGroups(prev => [g, ...prev]);
                  setSelected(g.id);
                  setNewGroupName('');
                }}
              >
                만들기
              </button>
            </div>
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockTitle}>코드로 참여</h3>
            <div className={styles.row}>
              <input
                className={styles.input}
                placeholder="초대코드"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
              />
              <button
                className={styles.btn}
                onClick={async () => {
                  if (!joinCode.trim()) return;
                  await Rank.joinByCode(joinCode.trim());
                  const gs = await Rank.myGroups();
                  setGroups(gs);
                  setJoinCode('');
                }}
              >
                참여
              </button>
            </div>
          </div>
        </aside>

        {/* 우: 랭킹 / 초대공유 / 그룹탈퇴 */}
        <section className={styles.content}>
          <div className={styles.contentHead}>
            <h2 className={styles.h2}>
              {selectedGroup ? selectedGroup.name : '그룹을 선택하세요'}
            </h2>
            {!!selected && (
              <div className={styles.actions}>
                <button
                  className={styles.btnGhost}
                  onClick={async () => {
                    const inv = await Rank.createInvite(selected, 72, 50);
                    setInvite(inv as InviteLink);
                  }}
                >
                  초대 링크 만들기
                </button>
                {invite && (
                  <>
                    <input readOnly className={styles.inputGhost} value={inviteUrl} />
                    <button className={styles.btn} onClick={() => navigator.clipboard.writeText(inviteUrl)}>
                      복사
                    </button>
                    <button className={styles.btn} onClick={shareInvite}>
                      카카오로 공유
                    </button>
                  </>
                )}
                <button
                  className={styles.btnDanger}
                  onClick={async () => {
                    if (!confirm('이 그룹에서 나가시겠어요?')) return;
                    await Rank.leave(selected);
                    const gs = await Rank.myGroups();
                    setGroups(gs);
                    setSelected(gs[0]?.id ?? null);
                    setInvite(null);
                    setLeaders([]);
                  }}
                >
                  그룹 나가기
                </button>
              </div>
            )}
          </div>

          {/* 리더보드 */}
          {loading ? (
            <div className={styles.empty}>불러오는 중…</div>
          ) : !leaders.length ? (
            <div className={styles.empty}>멤버가 없어요. 초대 링크를 공유해보세요!</div>
          ) : (
            <div className={styles.leaderList}>
              {leaders.map((r, i) => (
                <div key={r.userId} className={styles.leaderItem}>
                  <b className={styles.rankNo}>{i + 1}</b>
                  <div className={styles.leaderMeta}>
                    <div className={styles.leaderName}>{r.name}</div>
                    <div className={styles.leaderSub}>최근 30일 +{r.last30d.toLocaleString()}원</div>
                  </div>
                  <div className={styles.leaderTotal}>{r.total.toLocaleString()}원</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}