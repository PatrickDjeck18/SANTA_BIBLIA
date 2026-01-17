import { useGuestMoodTracker } from './useGuestMoodTracker';

export function useUnifiedMoodTracker() {
  // Directly use the guest mood tracker as the unified solution
  return useGuestMoodTracker();
}