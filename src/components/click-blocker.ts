/**
 * クリックブロッカー - フェイクバナーのクリックを阻止
 * Phase 5
 */

import type { AdInfo, VerificationInfo } from '../lib/types';
import { showWarningModal } from './warning-modal';

/**
 * フェイクバナーにクリックブロックを設定
 */
export const setupClickBlocker = (
  ad: AdInfo,
  verification: VerificationInfo
): void => {
  // バナー内の<a>タグを取得
  const linkElement = ad.element.querySelector<HTMLAnchorElement>('a');
  if (!linkElement) return;

  const originalUrl = linkElement.href;

  // クリックイベントをキャプチャフェーズで阻止
  linkElement.addEventListener('click', (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // 警告モーダルを表示
    showWarningModal({
      advertiserName: ad.advertiserName,
      matchedPattern: verification.matchedPattern,
      listType: verification.listType,
      originalUrl,
    });
  }, true); // capture: true で最優先

  // pointer-events を維持（オーバーレイの上からでもクリック検知）
  linkElement.style.pointerEvents = 'auto';
  linkElement.style.cursor = 'pointer';
  linkElement.style.position = 'relative';
  linkElement.style.zIndex = '10';
};
