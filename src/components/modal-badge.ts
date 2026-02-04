/**
 * モーダルバッジ - FakeAdAlertDemo
 * 個別投稿モーダル内にバッジとオーバーレイを表示
 */

import type { VerificationInfo } from '../lib/types';

const MODAL_BADGE_CLASS = 'fakead-modal-badge';
const MODAL_OVERLAY_CLASS = 'fakead-modal-overlay';

/**
 * モーダル内にバッジを表示
 */
export const showModalBadge = (
  headerElement: HTMLElement,
  verification: VerificationInfo
): void => {
  if (headerElement.querySelector(`.${MODAL_BADGE_CLASS}`)) {
    return;
  }

  const badge = document.createElement('span');
  badge.className = MODAL_BADGE_CLASS;

  if (verification.result === 'verified') {
    badge.innerHTML = `
      <span class="fakead-modal-badge-icon">✅</span>
      <span class="fakead-modal-badge-text">認証済み</span>
    `;
    badge.classList.add('fakead-modal-badge--verified');
  } else {
    badge.innerHTML = `
      <span class="fakead-modal-badge-icon">⚠️</span>
      <span class="fakead-modal-badge-text">未認証</span>
    `;
    badge.classList.add('fakead-modal-badge--warning');
  }

  const nameElement = headerElement.querySelector('a');
  if (nameElement) {
    nameElement.parentElement?.appendChild(badge);
  }
};

/**
 * モーダル内に警告オーバーレイを表示
 */
export const showModalOverlay = (
  mediaElement: HTMLElement,
  verification: VerificationInfo
): void => {
  if (verification.result === 'verified') {
    return;
  }

  if (mediaElement.parentElement?.querySelector(`.${MODAL_OVERLAY_CLASS}`)) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = MODAL_OVERLAY_CLASS;
  overlay.innerHTML = `
    <div class="fakead-modal-overlay-content">
      <span class="fakead-modal-overlay-icon">⚠️</span>
      <span class="fakead-modal-overlay-text">未認証アカウント</span>
    </div>
  `;

  const parent = mediaElement.parentElement;
  if (parent) {
    parent.style.position = 'relative';
    parent.appendChild(overlay);
  }
};
