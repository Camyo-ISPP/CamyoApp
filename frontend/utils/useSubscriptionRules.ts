import { useSubscription } from '../contexts/SubscriptionContext';
import { getSubscriptionRules, SubscriptionRule } from '../utils/subscriptionRules';

export const useSubscriptionRules = (): { 
  rules: SubscriptionRule; 
  loading: boolean;
  canCreateNewOffer: (offers: any[]) => boolean;
} => {
  const { subscriptionLevel, loading } = useSubscription();
  const rules = getSubscriptionRules(subscriptionLevel || 'GRATIS');

  const canCreateNewOffer = (offers: any[]) => {
    const activeOffersCount = offers.filter((offer) => offer.estado === 'ABIERTA').length;
    return activeOffersCount < rules.maxActiveOffers;
  };

  return { rules, loading, canCreateNewOffer };
};
