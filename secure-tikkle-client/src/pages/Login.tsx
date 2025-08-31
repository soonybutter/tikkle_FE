// src/pages/Login.tsx
//import React from 'react';

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  return (
    <main style={{ maxWidth: 480, margin: '3rem auto', textAlign: 'center' }}>
      <h1>로그인</h1>
      <p style={{ color: '#666' }}>소셜 계정으로 시작해요</p>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <a className="btn" href={`${API}/oauth2/authorization/kakao`}>카카오로 로그인</a>
        <a className="btn" href={`${API}/oauth2/authorization/naver`}>네이버로 로그인</a>
        <a className="btn" href={`${API}/oauth2/authorization/google`}>구글로 로그인</a>
      </div>
    </main>
  );
}
