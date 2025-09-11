export const API_BASE =
  import.meta.env.VITE_API_URL ??
  ((typeof location !== 'undefined') &&
   (location.hostname.endsWith('pages.dev') || location.hostname === 'tikkle.pages.dev')
    ? 'https://tikkle-api.koreacentral.cloudapp.azure.com' // Pages 도메인일 때 기본
    : 'http://localhost:8080');                              // 로컬 개발 기본

export class ApiError extends Error {
  constructor(public status: number, public data?: unknown) {
    super(`API Error: ${status}`);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // 모든 케이스(Record, 배열, Headers, undefined)를 Headers로 정규화
  const headers = new Headers(init.headers);

  // body가 있을 때만 Content-Type 자동 설정 (이미 있으면 건드리지 않음)
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(API_BASE + path, {
    credentials: 'include',
    ...init,
    headers, // ← 항상 Headers 객체
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

// 타입

export type LeaderRow = {
  userId: number;
  name: string;
  avatar?: string;
  total: number;
  last30d: number;
};

export type GroupMemberDto = {
  userId: number;
  name: string;
  avatar?: string;
  total: number;
  last30d: number;
};

export type GroupDetailDto = {
  id: number;
  members: GroupMemberDto[];
  name?: string; 
};

export type RankGroup = {
  id: number;
  name: string;
  memberCount?: number; 
};

export type RankInvite = { 
  code: string; 
  expiresAt: string; 
  maxUses: number; 
  used: number 
};

// API
export const Rank = {
  myGroups: () => get<RankGroup[]>('/api/rank/groups'),
  createGroup: (name: string) => post<RankGroup>('/api/rank/groups', { name }),
  createInvite: (groupId: number, ttlHours = 72, maxUses = 50) =>
    post<RankInvite>(`/api/rank/groups/${groupId}/invite`, { ttlHours, maxUses }),
  joinByCode: (code: string) => post<RankGroup>('/api/rank/join', { code }),
  //  반환 타입을 GroupDetailDto로 통일
  groupDetail: (id: number) => get<GroupDetailDto>(`/api/rank/groups/${id}`),
  leave: (id: number) => del<{ ok: boolean }>(`/api/rank/groups/${id}/leave`),
};