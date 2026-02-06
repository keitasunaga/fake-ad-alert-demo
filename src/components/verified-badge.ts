/**
 * 認証バッジ - FakeAdAlertDemo
 * VeriCerts認証済み広告にバッジを表示
 */

import type { AdInfo } from '../lib/types';

const BADGE_CLASS = 'fakead-verified-badge';

/**
 * 認証バッジを表示
 */
export const showVerifiedBadge = (ad: AdInfo): void => {
  if (!ad.headerElement) {
    console.log('[FakeAdAlertDemo] No header element for badge');
    return;
  }

  // 既にバッジがあれば何もしない
  if (ad.element.querySelector(`.${BADGE_CLASS}`)) {
    return;
  }

  // バッジ要素を作成
  const badge = document.createElement('span');
  badge.className = BADGE_CLASS;
  badge.innerHTML = `
    <span class="fakead-verified-icon">✅</span>
    <span class="fakead-verified-text">VC認証済み</span>
  `;

  // ヘッダー内のユーザー名リンクを探す
  // 方法1: ユーザー名のプロフィールリンクを探す
  const profileLink = ad.headerElement.querySelector('a[href^="/"][role="link"]');
  if (profileLink && profileLink.parentElement) {
    profileLink.parentElement.appendChild(badge);
    return;
  }

  // 方法2: ヘッダー内の最初のspan要素の親を使う
  const firstSpan = ad.headerElement.querySelector('span');
  if (firstSpan && firstSpan.parentElement) {
    firstSpan.parentElement.appendChild(badge);
    return;
  }

  // 方法3: フォールバック - ヘッダー自体に追加
  ad.headerElement.appendChild(badge);
};
