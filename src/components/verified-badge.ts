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
    <span class="fakead-verified-text">VeriCerts認証済み</span>
  `;

  // ヘッダーの適切な位置に挿入
  const nameContainer = ad.headerElement.querySelector('a, span');
  if (nameContainer) {
    nameContainer.parentElement?.appendChild(badge);
  }
};
