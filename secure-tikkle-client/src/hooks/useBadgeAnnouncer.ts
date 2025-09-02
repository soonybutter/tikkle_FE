import { useContext } from 'react';
import { BadgeAnnouncerContext } from '../providers/badgeAnnouncerContext';

export function useBadgeAnnouncer() {
  return useContext(BadgeAnnouncerContext);
}
