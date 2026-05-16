// Generate a short referral code from a userId
export function generateReferralCode(userId: string): string {
  const hash = userId
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)
    .toString(36)
    .toUpperCase();
  return `SM-${hash.slice(0, 6)}`;
}

export function validateReferralCode(code: string): boolean {
  return /^SM-[A-Z0-9]{4,8}$/.test(code);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return Promise.resolve();
}
