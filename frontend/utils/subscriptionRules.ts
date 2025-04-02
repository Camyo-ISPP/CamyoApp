export interface SubscriptionRule {
    maxActiveOffers: number;
    maxSponsoredOffers: number;
  }
  
  export const subscriptionRules: Record<string, SubscriptionRule> = {
    GRATIS: {
      maxActiveOffers: 1,
      maxSponsoredOffers: 1,
    },
    BASICO: {
      maxActiveOffers: 3,
      maxSponsoredOffers: 2,
    },
    PREMIUM: {
      maxActiveOffers: Infinity,
      maxSponsoredOffers: Infinity,
    },
  };
  
  export const getSubscriptionRules = (level: string): SubscriptionRule => {
    return subscriptionRules[level];
  };