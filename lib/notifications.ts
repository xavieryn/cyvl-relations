import { allOrgs } from './graph';
import { activitiesForOrg } from './activities';
import { daysSince } from './status';

const STALE_DAYS = 30;
const RENEWAL_DAYS = 120;

export type NotificationCounts = {
  staleAccounts: number;
  unansweredEmails: number;
  renewalsDue: number;
  total: number;
};

export function computeNotifications(): NotificationCounts {
  let stale = 0;
  let unanswered = 0;
  let renewals = 0;

  for (const org of allOrgs()) {
    const lastDays = daysSince(org.lastContacted);
    if (lastDays !== null && lastDays > STALE_DAYS) stale++;

    if (org.status === 'active-customer') {
      const statusDays = daysSince(org.statusSince);
      if (statusDays !== null && statusDays >= RENEWAL_DAYS) renewals++;
    }

    // Unanswered email: most recent email activity is inbound
    const emails = activitiesForOrg(org.id).filter((a) => a.kind === 'email');
    if (emails.length > 0 && emails[0].direction === 'inbound') unanswered++;
  }

  return {
    staleAccounts: stale,
    unansweredEmails: unanswered,
    renewalsDue: renewals,
    total: stale + unanswered + renewals,
  };
}
