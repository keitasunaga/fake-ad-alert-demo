/**
 * TikTokグリッドオーバーレイ - FakeAdAlertDemo
 * TikTokプロフィールページの動画グリッドにオーバーレイを表示
 * Phase 2
 */

import type { VerificationInfo } from '../lib/types';

const GRID_BADGE_CLASS = 'fakead-tiktok-grid-badge';
const GRID_WARNING_CLASS = 'fakead-tiktok-grid-warning';

/**
 * TikTok動画グリッドアイテムにオーバーレイを表示
 */
export const showTikTokGridOverlay = (
  gridItem: HTMLElement,
  verification: VerificationInfo
): void => {
  // 既にオーバーレイがあれば何もしない
  if (gridItem.querySelector(`.${GRID_BADGE_CLASS}, .${GRID_WARNING_CLASS}`)) {
    return;
  }

  const overlay = document.createElement('div');

  if (verification.result === 'verified') {
    overlay.className = GRID_BADGE_CLASS;
    overlay.innerHTML = '✅';
  } else {
    overlay.className = GRID_WARNING_CLASS;
    overlay.innerHTML = '⚠️';
  }

  // 親要素をrelativeに
  gridItem.style.position = 'relative';
  gridItem.appendChild(overlay);
};
