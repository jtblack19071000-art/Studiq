const FOUNDER_EMAILS = new Set(['jtblack07@icloud.com', 'cadenmichael0808@gmail.com']);

/** True for the app's own founder accounts, who always have Premium regardless of subscription status. */
export function isFounderEmail(email: string | null | undefined): boolean {
  return Boolean(email && FOUNDER_EMAILS.has(email.toLowerCase()));
}
