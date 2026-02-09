import { useEffect, useState } from 'react';
import { Auth, type MeResponse } from '../api';

type MeOk = { authenticated: true; attributes: { id: number; name?: string | null; provider?: string; email?: string | null; userKey?: string } };
type MeNo = { authenticated: false };
export type Me = MeOk | MeNo;

function normalizeMe(resp: MeResponse): Me {
  if (resp.authenticated && resp.attributes && typeof resp.attributes.id === 'number') {
    return { authenticated: true, attributes: resp.attributes };
  }
  return { authenticated: false };
}

export function useSession() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await Auth.me();
      setMe(normalizeMe(data));
    } catch {
      setMe({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);
  return { me, loading, refresh };
}
