import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Rank, ApiError } from '../api';

export default function InviteAccept() {
  const { code } = useParams<{ code: string }>();
  const nav = useNavigate();
  const [msg, setMsg] = useState<string>('참여 처리 중…');

  useEffect(() => {
    if (!code) {
      setMsg('유효하지 않은 초대코드입니다.');
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const g = await Rank.joinByCode(code);
        if (!mounted) return;
        setMsg('참여 완료! 그룹으로 이동합니다.');
        // 브라우저 환경 보장: window.setTimeout 사용 (타입 number)
        window.setTimeout(() => nav(`/groups/${g.id}`), 600);
      } catch (err: unknown) {
        if (!mounted) return;
        // 에러 타입 안전하게 좁히기
        let text = '초대코드가 유효하지 않거나 만료되었습니다.';
        if (err instanceof ApiError) {
          if (err.status === 404) text = '초대코드를 찾을 수 없어요.';
          else if (err.status === 410) text = '초대코드가 만료되었어요.';
        }
        setMsg(text);
      }
    })();

    return () => {
      mounted = false;
    };
    // nav는 안정적인 참조이지만, 룰을 맞추려면 의존성에 포함
  }, [code, nav]);

  return (
    <main className="container" style={{ padding: '40px 12px' }} role="status">
      {msg}
    </main>
  );
}