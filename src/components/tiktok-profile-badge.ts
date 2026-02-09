/**
 * TikTokプロフィールバッジ - FakeAdAlertDemo
 * TikTokプロフィールページのヘッダーに認証バッジ/警告を表示
 * Phase 2
 */

import type { VerificationInfo } from '../lib/types';

const PROFILE_BADGE_CLASS = 'fakead-tiktok-profile-badge';
const PROFILE_WARNING_CLASS = 'fakead-tiktok-profile-warning';

/**
 * TikTokプロフィールヘッダーにバッジを表示
 */
export const showTikTokProfileBadge = (
  headerElement: HTMLElement,
  username: string,
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
      <span class="fakead-tiktok-profile-badge-icon">✅</span>
      <span class="fakead-tiktok-profile-badge-text">VC認証済み</span>
    `;
  } else {
    badge.className = PROFILE_WARNING_CLASS;
    badge.innerHTML = `
      <span class="fakead-tiktok-profile-warning-icon">⚠️</span>
      <span class="fakead-tiktok-profile-warning-text">未認証アカウント</span>
    `;
  }

  // ユーザー名の近くに挿入
  // 方法1: ユーザー名要素を探す
  const titleElement = headerElement.querySelector('[data-e2e="user-title"], h1, h2');
  if (titleElement && titleElement.parentElement) {
    titleElement.parentElement.appendChild(badge);
    return;
  }

  // 方法2: プロフィール情報エリアを探す
  const infoContainer = headerElement.querySelector('[class*="DivShareInfo"], [class*="ProfileHeader"]');
  if (infoContainer) {
    infoContainer.appendChild(badge);
    return;
  }

  // フォールバック: headerElementに追加
  headerElement.appendChild(badge);
};
