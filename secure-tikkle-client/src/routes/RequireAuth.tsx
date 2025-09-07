import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Auth } from '../api';

export default function RequireAuth() {
  const loc = useLocation();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await Auth.me();
        if (mounted) setOk(!!me.authenticated);
      } catch {
        if (mounted) setOk(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (ok === null) return null; 

  return ok ? <Outlet /> : <Navigate to="/login" state={{ from: loc }} replace />;
}
