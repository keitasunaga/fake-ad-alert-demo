/**
 * プロフィールバッジ - FakeAdAlertDemo
 * プロフィールページのヘッダーに認証バッジ/警告を表示
 */

import type { VerificationInfo } from '../lib/types';

const PROFILE_BADGE_CLASS = 'fakead-profile-badge';
const PROFILE_WARNING_CLASS = 'fakead-profile-warning';

/**
 * プロフィールヘッダーにバッジを表示
 */
export const showProfileBadge = (
  headerElement: HTMLElement,
  verification: VerificationInfo
): void => {
  // 既にバッジがあれば何もしない
  if (headerElement.querySelector(`.${PROFILE_BADGE_CLASS}, .${PROFILE_WARNING_CLASS}`)) {
    return;
  }

  const badge = document.createElement('div');

  if (verification.result === 'verified') {
    badge.className = PROFILE_BADGE_CLASS;
    badge.innerHTML = `
      <span class="fakead-profile-badge-icon">✅</span>
      <span class="fakead-profile-badge-text">VeriCerts認証済み</span>
    `;
  } else {
    badge.className = PROFILE_WARNING_CLASS;
    badge.innerHTML = `
      <span class="fakead-profile-warning-icon">⚠️</span>
      <span class="fakead-profile-warning-text">未認証アカウント</span>
    `;
  }

  // ヘッダー内の適切な位置に挿入
  const titleElement = headerElement.querySelector('h2, h1');
  if (titleElement) {
    titleElement.parentElement?.appendChild(badge);
  } else {
    headerElement.appendChild(badge);
  }
};
