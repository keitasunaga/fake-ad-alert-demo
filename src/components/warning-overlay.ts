/**
 * 警告オーバーレイ - FakeAdAlertDemo
 * フェイク広告・未認証広告に警告を表示
 */

import type { AdInfo, VerificationInfo } from '../lib/types';

const OVERLAY_CLASS = 'fakead-warning-overlay';

/**
 * 警告オーバーレイを表示
 */
export const showWarningOverlay = (ad: AdInfo, verification: VerificationInfo): void => {
  if (!ad.imageElement) {
    return;
  }

  // 既にオーバーレイがあれば何もしない
  if (ad.element.querySelector(`.${OVERLAY_CLASS}`)) {
    return;
  }

  // オーバーレイ要素を作成
  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;
  overlay.innerHTML = `
    <div class="fakead-warning-content">
      <span class="fakead-warning-icon">⚠️</span>
      <span class="fakead-warning-title">未認証広告</span>
      <span class="fakead-warning-subtitle">詐欺の可能性があります</span>
    </div>
  `;

  // 親要素をrelativeに（オーバーレイ配置用）
  const parent = ad.imageElement.parentElement;
  if (parent) {
    parent.style.position = 'relative';
    parent.appendChild(overlay);
  }
};
