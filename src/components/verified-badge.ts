/**
 * 認証バッジ - FakeAdAlertDemo
 * VeriCerts認証済み広告にバッジを表示
 * Phase 2: TikTok対応
 */

import type { AdInfo, Platform } from '../lib/types';

const BADGE_CLASS = 'fakead-verified-badge';

/**
 * 認証バッジを表示
 */
export const showVerifiedBadge = (
  ad: AdInfo,
  platform: Platform = 'instagram'
): void => {
  // 既にバッジがあれば何もしない
  if (ad.element.querySelector(`.${BADGE_CLASS}`)) {
    return;
  }

  // バッジ要素を作成（プラットフォーム別クラス付与）
  const badge = document.createElement('span');
  badge.className = `${BADGE_CLASS} ${BADGE_CLASS}--${platform}`;
  badge.innerHTML = `
    <span class="fakead-verified-icon">✅</span>
    <span class="fakead-verified-text">VC認証済み</span>
  `;

  // プラットフォーム別の挿入ロジック
  if (platform === 'tiktok') {
    // TikTok: ユーザー名の横に挿入
    insertBadgeForTikTok(ad, badge);
  } else {
    // Instagram: プロフィールリンクの横に挿入
    insertBadgeForInstagram(ad, badge);
  }
};

/**
 * Instagram用バッジ挿入
 */
const insertBadgeForInstagram = (ad: AdInfo, badge: HTMLElement): void => {
  // article全体からユーザー名リンクを探してバッジを挿入
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

  // フォールバック: headerがあればその中に追加
  if (ad.headerElement) {
    ad.headerElement.appendChild(badge);
    return;
  }

  // フォールバック: article内の最初のdivに追加
  const firstDiv = ad.element.querySelector('div');
  if (firstDiv) {
    firstDiv.appendChild(badge);
  }
};

/**
 * TikTok用バッジ挿入
 */
const insertBadgeForTikTok = (ad: AdInfo, badge: HTMLElement): void => {
  // TikTok: ユーザー名の横
  if (ad.headerElement) {
    const authorElement = ad.headerElement.querySelector(
      '[data-e2e="video-author-uniqueid"], .author-uniqueId, a[href^="/@"]'
    );
    if (authorElement && authorElement.parentElement) {
      authorElement.parentElement.appendChild(badge);
      return;
    }
    // フォールバック
    ad.headerElement.appendChild(badge);
    return;
  }

  // フォールバック: element内のユーザー名リンクを探す
  const userLink = ad.element.querySelector('a[href^="/@"]');
  if (userLink && userLink.parentElement) {
    userLink.parentElement.appendChild(badge);
    return;
  }

  // 最終フォールバック
  const firstDiv = ad.element.querySelector('div');
  if (firstDiv) {
    firstDiv.appendChild(badge);
  }
};
