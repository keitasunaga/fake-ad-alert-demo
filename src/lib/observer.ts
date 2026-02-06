/**
 * DOM監視 - FakeAdAlertDemo
 * MutationObserverで動的にロードされる広告を検出
 */

import { detectAds } from './detector';
import { verifyAdvertiser } from './verifier';
import { showWarningOverlay } from '../components/warning-overlay';
import { showVerifiedBadge } from '../components/verified-badge';

let observer: MutationObserver | null = null;

/**
 * 検出した広告を処理
 */
const processAds = (): void => {
  const ads = detectAds();

  ads.forEach((ad) => {
    const verification = verifyAdvertiser(ad.advertiserName);

    console.log(`[FakeAdAlertDemo] Ad detected: ${ad.advertiserName} -> ${verification.result}`);

    if (verification.result === 'verified') {
      showVerifiedBadge(ad);
    } else {
      showWarningOverlay(ad, verification);
    }
  });
};

/**
 * MutationObserverを開始
 */
export const startObserver = (): void => {
  if (observer) {
    return;
  }

  // 初回スキャン
  processAds();

  // DOM変更を監視
  observer = new MutationObserver((mutations) => {
    // 追加されたノードがあれば処理
    const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasAddedNodes) {
      // デバウンス（頻繁な呼び出しを防ぐ）
      requestAnimationFrame(() => {
        processAds();
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('[FakeAdAlertDemo] Observer started');
};

/**
 * MutationObserverを停止
 */
export const stopObserver = (): void => {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log('[FakeAdAlertDemo] Observer stopped');
  }
};
