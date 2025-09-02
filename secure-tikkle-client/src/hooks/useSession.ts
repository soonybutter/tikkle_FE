import { useEffect, useState } from 'react';
import { Auth } from '../api';
import type { MeResponse as ApiMeResponse } from '../api';

type Attributes = NonNullable<ApiMeResponse['attributes']>;

type Me =
  | { authenticated: true; attributes: Attributes }
  | { authenticated: false };

function normalizeMe(resp: ApiMeResponse): Me {
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
      const data: ApiMeResponse = await Auth.me();
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
