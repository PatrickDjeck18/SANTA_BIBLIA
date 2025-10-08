export const initializeAdMob = async () => {};

export interface BannerAdProps {
  unitId: string;
  size?: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
}

export class InterstitialAdService {
  constructor(private unitId: string) {}
  async showAd(): Promise<boolean> { return false; }
}

export class RewardedAdService {
  constructor(private unitId: string) {}
  async showAd(): Promise<{ success: boolean; reward?: any }> { return { success: false }; }
}

export class AdManager {
  static getInterstitial(unitId: string): InterstitialAdService { return new InterstitialAdService(unitId); }
  static getRewarded(unitId: string): RewardedAdService { return new RewardedAdService(unitId); }
}


