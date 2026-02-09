import { useEffect, useState } from 'react';
import { Auth } from '../api';
import Home from './Home';
import Intro from './Intro';

export default function Landing() {
  const [authed, setAuthed] = useState<boolean | null>(null);

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

  if (authed === null) return null;      
  return authed ? <Home /> : <Intro />;  
}