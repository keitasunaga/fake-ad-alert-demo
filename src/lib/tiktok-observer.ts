/**
 * TikTok DOM監視 - FakeAdAlertDemo
 * TikTokフィードの動的コンテンツを監視
 * Phase 2
 */

import {
  detectAllTikTokPosts,
  detectTikTokProfile,
  isTikTokProfilePage,
  getUsernameFromUrl,
  markTikTokProfileProcessed,
  markTikTokGridItemProcessed,
} from './tiktok-detector';
import { verifyAdvertiser } from './verifier';
import { showWarningOverlay } from '../components/warning-overlay';
import { showVerifiedBadge } from '../components/verified-badge';
import { showTikTokProfileBadge } from '../components/tiktok-profile-badge';
import { showTikTokGridOverlay } from '../components/tiktok-grid-overlay';

const SCRIPT_NAME = '[FakeAdAlertDemo]';

let observer: MutationObserver | null = null;
let processingTimeout: number | null = null;
let lastUrl = '';

/**
 * 検出したTikTok投稿を処理（デモモード）
 */
const processTikTokPosts = (): void => {
  const posts = detectAllTikTokPosts();

  posts.forEach((post) => {
    const verification = verifyAdvertiser(post.advertiserName);
    console.log(`${SCRIPT_NAME} TikTok Post: ${post.advertiserName} -> ${verification.result}`);

    if (verification.result === 'verified') {
      showVerifiedBadge(post, 'tiktok');
    } else if (verification.result === 'fake') {
      // ブラックリストのみ警告表示（unknownは何も表示しない）
      showWarningOverlay(post, verification, 'tiktok');
    }
    // unknown の場合は何も表示しない
  });
};

/**
 * プロフィールページを処理
 */
const processTikTokProfile = (): void => {
  const profile = detectTikTokProfile();
  if (!profile) return;

  const verification = verifyAdvertiser(profile.username);
  console.log(`${SCRIPT_NAME} TikTok Profile: ${profile.username} -> ${verification.result}`);

  // unknown の場合は何も表示しない
  if (verification.result === 'unknown') {
    // 処理済みマークだけつけて終了
    if (profile.headerElement) {
      markTikTokProfileProcessed(profile.headerElement);
    }
    profile.gridItems.forEach((item) => {
      markTikTokGridItemProcessed(item);
    });
    return;
  }

  // ヘッダーバッジ（verified または fake の場合のみ）
  if (profile.headerElement) {
    showTikTokProfileBadge(profile.headerElement, profile.username, verification);
    markTikTokProfileProcessed(profile.headerElement);
  }

  // グリッドオーバーレイ（verified または fake の場合のみ）
  profile.gridItems.forEach((item) => {
    showTikTokGridOverlay(item, verification);
    markTikTokGridItemProcessed(item);
  });
};

/**
 * ページ種別に応じた処理を実行
 */
const processPage = (): void => {
  if (isTikTokProfilePage()) {
    console.log(`${SCRIPT_NAME} Page type: TikTok profile`);
    processTikTokProfile();
  } else {
    console.log(`${SCRIPT_NAME} Page type: TikTok feed`);
    processTikTokPosts();
  }
};

/**
 * デバウンス付きで処理を実行
 */
const debouncedProcess = (): void => {
  if (processingTimeout) {
    cancelAnimationFrame(processingTimeout);
  }
  processingTimeout = requestAnimationFrame(() => {
    processPage();
  });
};

/**
 * URL変更を検出
 */
const checkUrlChange = (): void => {
  if (lastUrl !== window.location.href) {
    console.log(`${SCRIPT_NAME} TikTok URL changed: ${lastUrl} -> ${window.location.href}`);
    lastUrl = window.location.href;
    setTimeout(processPage, 500); // DOM更新を待つ
  }
};

/**
 * TikTok用MutationObserverを開始
 */
export const startTikTokObserver = (): void => {
  if (observer) {
    return;
  }

  console.log(`${SCRIPT_NAME} Starting TikTok Observer...`);
  lastUrl = window.location.href;

  // 初回スキャン
  processPage();

  // DOM変更を監視
  observer = new MutationObserver((mutations) => {
    // URL変更チェック
    checkUrlChange();

    const hasRelevantChanges = mutations.some((m) => {
      // 追加されたノードがあるか、属性が変更されたか
      return m.addedNodes.length > 0 || m.type === 'attributes';
    });

    if (hasRelevantChanges) {
      debouncedProcess();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // popstate でURL変更を監視（ブラウザの戻る/進むボタン）
  window.addEventListener('popstate', () => {
    checkUrlChange();
  });

  console.log(`${SCRIPT_NAME} TikTok Observer started`);
};

/**
 * TikTok用MutationObserverを停止
 */
export const stopTikTokObserver = (): void => {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log(`${SCRIPT_NAME} TikTok Observer stopped`);
  }

  if (processingTimeout) {
    cancelAnimationFrame(processingTimeout);
    processingTimeout = null;
  }
};
