const API = import.meta.env.VITE_API_URL ?? '';

// 공통 API 에러 
export class ApiError extends Error {
  constructor(public status: number, public data?: unknown) {
    super(`API Error: ${status}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const data: unknown = await res.json().catch(() => undefined);
    throw new ApiError(res.status, data);
  }

  // 204 같은 경우 빈 바디일 수 있음
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const get = <T>(path: string) => request<T>(path);
export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });
export const patch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

/*/ ---- 백엔드 DTO ---- */
export type GoalSummaryDto = {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
};

export type GoalDetailDto = {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
};

export type SavingsLogDto = {
  id: number;
  goalId: number;
  amount: number;
  memo?: string | null;
  createdAt: string; // ISO
};

export type BadgeDto ={
  code: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

export type CreatedGoalEntity = {
  id: number;
  title?: string;
  currentAmount?: number;
  targetAmount?: number;
};

export type MeResponse = {
  authenticated: boolean;
  attributes?: {
    id: number;
    name?: string | null;
    email?: string | null;
    provider?: string;
    userKey?: string;
  };
};

/** ---- 리소스 API ---- */
export const Auth = {
  me: () => get<MeResponse>('/api/me'),
  logout: ()=> post<{ ok: boolean }>('/api/logout') // 로그아웃 시 사용
};

export const Goals = {
  list: () => get<GoalSummaryDto[]>('/api/goals'),
  detail: (id: number) => get<GoalDetailDto>(`/api/goals/${id}`),
  logs: (id: number, page = 0, size = 10) =>
    get<Page<SavingsLogDto>>(`/api/goals/${id}/logs?page=${page}&size=${size}`),
  create: (p: { title: string; targetAmount: number }) =>
    post<CreatedGoalEntity>('/api/goals', p),

   async remove(id: number): Promise<void> {
    const r = await fetch(`/api/goals/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!r.ok) throw new ApiError(r.status, await safeJson(r));
  },
};

export const Savings = {
  create: (p: { goalId: number; amount: number; memo?: string }) =>
    post<SavingsLogDto>('/api/savings-logs', p),

  async update(payload: { id: number; amount: number; memo?: string }): Promise<void> {
    const r = await fetch(`/api/savings/${payload.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount: payload.amount, memo: payload.memo ?? null }),
    });
    if (!r.ok) throw new ApiError(r.status, await safeJson(r));
  },

  async remove(id: number): Promise<void> {
    const r = await fetch(`/api/savings/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!r.ok) throw new ApiError(r.status, await safeJson(r));
  },

  
};

async function safeJson(r: Response) {
  try { return await r.json(); } catch { return null; }
}

export const Badges = {
  list: () => get<BadgeDto[]>('/api/badges'),
};
