// src/api.ts

// ========= 공용 타입 =========
export type MeOk = {
  authenticated: true;
  attributes: { id: number; name?: string; provider?: string; email?: string };
};
export type MeNo = { authenticated: false };
export type Me = MeOk | MeNo;

export type GoalSummaryDto = {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
};

export type GoalDetailDto = GoalSummaryDto;

export type SavingsLogDto = {
  id: number;
  goalId: number;
  amount: number;
  memo?: string;
  createdAt: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  number: number; // current page
  size: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
};


// ========= 에러 타입 =========
export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';

// 오류 응답 파싱 (JSON 우선, 실패 시 텍스트)
// 반환 타입을 never로 두어, 호출 측에서 throw로 흐름이 끊기는 걸 명확히 표시
async function parseError(res: Response): Promise<never> {
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const data: unknown = await res.json();
    // 서버 표준 에러 포맷을 최대한 읽어 메시지 구성
    let msg = res.statusText;
    if (typeof data === 'object' && data !== null) {
      const d = data as Record<string, unknown>;
      if (typeof d.message === 'string') msg = d.message;
      else if (typeof d.error === 'string') msg = d.error;
      else if (Array.isArray(d.errors) && d.errors.length > 0) {
        const first = d.errors[0] as Record<string, unknown>;
        if (typeof first.msg === 'string') msg = first.msg;
      }
    }
    throw new ApiError(msg || 'Request failed', res.status, data);
  } else {
    const text = await res.text();
    throw new ApiError(text || res.statusText || 'Request failed', res.status, text);
  }
}

// 제네릭 API 함수
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include', // 세션 쿠키 포함
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    await parseError(res); // throws
  }

  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  // 백엔드에서 text/plain 같은 걸 줄 수도 있어요
  return (await res.text()) as unknown as T;
}

// ========= 엔드포인트 래퍼 =========
export const Auth = {
  me: (): Promise<Me> => api<Me>('/api/me'),
  loginUrl: (p: 'kakao' | 'naver' | 'google'): string => `${API_BASE}/oauth2/authorization/${p}`,
  logout: (): Promise<string | { ok?: boolean }> =>
    api('/api/logout', { method: 'POST' }),
};

export const Goals = {
  list: (): Promise<GoalSummaryDto[]> => api<GoalSummaryDto[]>('/api/goals'),
  create: (payload: { title: string; targetAmount: number }): Promise<GoalSummaryDto | GoalDetailDto | GoalSummaryDto[]> =>
    api('/api/goals', { method: 'POST', body: JSON.stringify(payload) }),
  detail: (id: number): Promise<GoalDetailDto> => api<GoalDetailDto>(`/api/goals/${id}`),
  logs: (id: number, page = 0, size = 10): Promise<Page<SavingsLogDto>> =>
    api<Page<SavingsLogDto>>(`/api/goals/${id}/logs?page=${page}&size=${size}`),
  addLog: (payload: { goalId: number; amount: number; memo?: string }): Promise<SavingsLogDto> =>
    api<SavingsLogDto>('/api/savings-logs', { method: 'POST', body: JSON.stringify(payload) }),
};
