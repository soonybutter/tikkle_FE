import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Auth } from '../api';

export default function RequireAuth() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await Auth.me();
        if (mounted) setAuthed(!!me?.authenticated);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [location.key]);

  if (checking) return null;
  if (!authed) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}