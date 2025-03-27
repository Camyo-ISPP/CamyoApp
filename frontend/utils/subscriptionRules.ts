export interface SubscriptionRule {
    maxActiveOffers: number;
    maxSponsoredOffers: number;
    fullFormFields: boolean;
  }
  
  export const subscriptionRules: Record<string, SubscriptionRule> = {
    GRATIS: {
      maxActiveOffers: 1,
      maxSponsoredOffers: 0,
      fullFormFields: false,
    },
    BASICO: {
      maxActiveOffers: 3,
      maxSponsoredOffers: 2,
      fullFormFields: true,
    },
    PREMIUM: {
      maxActiveOffers: Infinity,
      maxSponsoredOffers: Infinity,
      fullFormFields: true,
    },
  };
  
  export const getSubscriptionRules = (level: string): SubscriptionRule => {
    return subscriptionRules[level];
  };