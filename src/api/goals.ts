export type Goal = {
  id: number;
  title: string;
  savedAmount: number;
  targetAmount: number;
  imageUrl?: string;
  createdAt?: string;
};

export type GoalSummaryDto = {
  id: number;
  title: string;
  targetAmount: number;
  totalSaved?: number;      // 서버에서 누적 저축액으로 주는 경우
  progressPct?: number;     // 0~100인 퍼센트로 주는 경우
  imageUrl?: string;
  createdAt?: string;
};

function toGoal(dto: GoalSummaryDto): Goal {
  const savedAmount =
    typeof dto.totalSaved === 'number'
      ? dto.totalSaved
      : typeof dto.progressPct === 'number'
        ? Math.round((dto.progressPct / 100) * dto.targetAmount)
        : 0;

  return {
    id: dto.id,
    title: dto.title,
    targetAmount: dto.targetAmount,
    savedAmount,
    imageUrl: dto.imageUrl,
    createdAt: dto.createdAt,
  };
}

export const Goals = {
  async list(): Promise<Goal[]> {             
    const res = await fetch('/api/goals', { credentials: 'include' });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error('FAILED');

    const raw: GoalSummaryDto[] = await res.json();
    return raw.map(toGoal);                     
  },
};