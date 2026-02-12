/**
 * Content Script - デモニュースサイト
 * Phase 5: バナー広告検出 + クリックブロック
 */

import { detectNewsBanners } from '../lib/news-detector';
import { verifyAdvertiser } from '../lib/verifier';
import { showWarningOverlay } from '../components/warning-overlay';
import { showVerifiedBadge } from '../components/verified-badge';
import { setupClickBlocker } from '../components/click-blocker';
import type { VerificationInfo } from '../lib/types';
import './news-site.css';

const SCRIPT_NAME = '[FakeAdAlertDemo:NewsPage]';

/**
 * バナー広告を検出・判定・UI表示
 */
const processNewsBanners = (): void => {
  const banners = detectNewsBanners();
  console.log(`${SCRIPT_NAME} Detected ${banners.length} banners`);

  banners.forEach((banner) => {
    const verification = verifyAdvertiser(banner.advertiserName);
    console.log(`${SCRIPT_NAME} ${banner.advertiserName}: ${verification.result}`);

    if (verification.result === 'verified') {
      showVerifiedBadge(banner, 'news-site');
    } else {
      // fake または unknown → 警告表示 + クリックブロック
      showWarningOverlay(banner, verification, 'news-site');
      setupClickBlocker(banner, verification);
    }

    notifyBackground(banner.advertiserName, verification);
  });
};

/**
 * サイト自体のVC情報をBackground Scriptに通知（Phase 6）
 */
const notifySiteDetected = (): void => {
  chrome.runtime.sendMessage({
    type: 'SITE_DETECTED',
    siteName: 'デイリーニュース Japan',
    platform: 'news-site',
  });
};

/**
 * Background Scriptに通知
 */
const notifyBackground = (
  advertiserName: string,
  verification: VerificationInfo
): void => {
  chrome.runtime.sendMessage({
    type: 'AD_DETECTED',
    advertiserName,
    platform: 'news-site',
    result: verification.result,
    matchedPattern: verification.matchedPattern,
    listType: verification.listType,
  });
};

// 初期化
const init = (): void => {
  console.log(`${SCRIPT_NAME} Content script loaded`);
  notifySiteDetected();
  processNewsBanners();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
