import { useEffect, useState } from 'react';
import { Auth } from '../api';

type MeOk = { authenticated: true; attributes: { id: number; name?: string; provider?: string; email?: string } };
type MeNo = { authenticated: false };
type Me = MeOk | MeNo;

export function useSession() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await Auth.me();
      setMe(data);
    } catch {
      setMe({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { me, loading, refresh };
}