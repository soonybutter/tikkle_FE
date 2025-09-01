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
    let data: unknown;
    try { data = await res.json(); } catch {}
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
  // 필요시: providers 링크 등 추가
};

export const Goals = {
  list: () => get<GoalSummaryDto[]>('/api/goals'),
  detail: (id: number) => get<GoalDetailDto>(`/api/goals/${id}`),
  logs: (id: number, page = 0, size = 10) =>
    get<Page<SavingsLogDto>>(`/api/goals/${id}/logs?page=${page}&size=${size}`),
  create: (p: { title: string; targetAmount: number }) =>
    post<CreatedGoalEntity>('/api/goals', p),
};

export const Savings = {
  create: (p: { goalId: number; amount: number; memo?: string }) =>
    post<SavingsLogDto>('/api/savings-logs', p),
  
};
