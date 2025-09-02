import { createContext } from 'react';

export type BadgeAnnouncerCtx = { triggerScan: () => Promise<void> };

export const BadgeAnnouncerContext = createContext<BadgeAnnouncerCtx>({
  triggerScan: () => Promise.resolve(),
});