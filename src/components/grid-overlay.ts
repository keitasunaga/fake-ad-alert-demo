/**
 * グリッドオーバーレイ - FakeAdAlertDemo
 * プロフィールページのグリッドアイテムにオーバーレイを表示
 */

import type { VerificationInfo } from '../lib/types';

const GRID_BADGE_CLASS = 'fakead-grid-badge';
const GRID_WARNING_CLASS = 'fakead-grid-warning';

/**
 * グリッドアイテムにオーバーレイを表示
 */
export const showGridOverlay = (
  gridItem: HTMLElement,
  verification: VerificationInfo
): void => {
  // 既にオーバーレイがあれば何もしない
  if (gridItem.querySelector(`.${GRID_BADGE_CLASS}, .${GRID_WARNING_CLASS}`)) {
    return;
  }

  // 親要素をrelativeに
  gridItem.style.position = 'relative';

  const overlay = document.createElement('div');

  if (verification.result === 'verified') {
    overlay.className = GRID_BADGE_CLASS;
    overlay.innerHTML = '✅';
  } else {
    overlay.className = GRID_WARNING_CLASS;
    overlay.innerHTML = '⚠️';
  }

  gridItem.appendChild(overlay);
};
