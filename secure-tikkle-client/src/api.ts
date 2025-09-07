const API = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(public status: number, public data?: unknown) {
    super(`API Error: ${status}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const data: unknown = await res.json().catch(() => undefined);
    throw new ApiError(res.status, data);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const get   = <T>(path: string) => request<T>(path);
export const post  = <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST',  body: JSON.stringify(body) });
export const del   = <T>(path: string)                   => request<T>(path, { method: 'DELETE' });
export const patch = <T>(path: string, body?: unknown)  => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

/* ---- 타입들 동일 (생략 없이 유지) ---- */
export type GoalSummaryDto = { 
  id: number; 
  title: string; 
  targetAmount: number; 
  currentAmount: number; 
  progress: number; 
};

export type GoalDetailDto  = GoalSummaryDto;
export type SavingsLogDto  = {
   id: number; 
   goalId: number; 
   amount: number; 
   memo?: string | null; 
   createdAt: string; 
};

export type BadgeDto = { 
  code: string; 
  title: string; 
  description: string; 
  icon: string; 
  earned: boolean; 
  earnedAt?: string; 
};

export type Page<T>  = { 
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
  logout: () => post<{ ok: boolean }>('/api/logout'),
};

export const Goals = {
  list:   () => get<GoalSummaryDto[]>('/api/goals'),
  detail: (id: number) => get<GoalDetailDto>(`/api/goals/${id}`),
  logs:   (id: number, page = 0, size = 10) => get<Page<SavingsLogDto>>(`/api/goals/${id}/logs?page=${page}&size=${size}`),
  create: (p: { title: string; targetAmount: number }) => post<CreatedGoalEntity>('/api/goals', p),
  update: (id: number, p: { title?: string; targetAmount?: number }) =>
  patch<void>(`/api/goals/${id}`, p),
  remove: (id: number) => del<void>(`/api/goals/${id}`),
};

export const Savings = {
  
  //  새 저축기록 생성 (POST /api/goals/:goalId/savings)
  create: (p: { goalId: number; amount: number; memo?: string }) =>
    post<SavingsLogDto>(`/api/goals/${p.goalId}/savings`, {
      amount: p.amount,
      memo: p.memo ?? null,
    }),

  //  수정 (PATCH /api/goals/:goalId/savings/:id)
  update: (p: { goalId: number; id: number; amount: number; memo?: string }) =>
    patch<void>(`/api/goals/${p.goalId}/savings/${p.id}`, {
      amount: p.amount,
      memo: p.memo ?? null,
    }),

  //  삭제 (DELETE /api/goals/:goalId/savings/:id)
  remove: (goalId: number, id: number) =>
    del<void>(`/api/goals/${goalId}/savings/${id}`),
};

export const Badges = {
  list: () => get<BadgeDto[]>('/api/badges'),
};
