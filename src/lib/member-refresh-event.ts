export const MEMBER_WALLET_REFRESH_EVENT = "scorematrix:member-wallet-refresh";

export function dispatchMemberWalletRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MEMBER_WALLET_REFRESH_EVENT));
}
