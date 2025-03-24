import { useSubscription } from '../contexts/SubscriptionContext';
import { getSubscriptionRules, SubscriptionRule } from '../utils/subscriptionRules';

export const useSubscriptionRules = (): { rules: SubscriptionRule; loading: boolean } => {
  const { subscriptionLevel, loading } = useSubscription();
  const rules = getSubscriptionRules(subscriptionLevel || 'GRATIS');

  return { rules, loading };
};