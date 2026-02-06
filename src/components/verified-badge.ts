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

  // article全体からユーザー名リンクを探してバッジを挿入
  // 方法1: プロフィールリンクを探す（ユーザー名のリンク）
  const allLinks = ad.element.querySelectorAll('a[href^="/"][role="link"]');
  for (const link of allLinks) {
    const href = link.getAttribute('href');
    // プロフィールリンクのパターン: /{username}/ or /{username}/?hl=ja
    if (href && /^\/[a-zA-Z0-9._]+\/?(\?.*)?$/.test(href)) {
      // 除外パターン
      if (!href.startsWith('/p/') && !href.startsWith('/reel') &&
          !href.startsWith('/explore') && !href.startsWith('/stories')) {
        // リンクの親要素にバッジを追加
        if (link.parentElement) {
          link.parentElement.appendChild(badge);
          return;
        }
      }
    }
  }

  // 方法2: headerがあればその中に追加
  if (ad.headerElement) {
    ad.headerElement.appendChild(badge);
    return;
  }

  // 方法3: article内の最初のdivに追加
  const firstDiv = ad.element.querySelector('div');
  if (firstDiv) {
    firstDiv.appendChild(badge);
  }
};
