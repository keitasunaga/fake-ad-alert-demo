/**
 * TikTok DOM監視 - FakeAdAlertDemo
 * TikTokフィードの動的コンテンツを監視
 * Phase 2
 */

import { detectAllTikTokPosts } from './tiktok-detector';
import { verifyAdvertiser } from './verifier';
import { showWarningOverlay } from '../components/warning-overlay';
import { showVerifiedBadge } from '../components/verified-badge';

const SCRIPT_NAME = '[FakeAdAlertDemo]';

let observer: MutationObserver | null = null;
let processingTimeout: number | null = null;

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
 * デバウンス付きで処理を実行
 */
const debouncedProcess = (): void => {
  if (processingTimeout) {
    cancelAnimationFrame(processingTimeout);
  }
  processingTimeout = requestAnimationFrame(() => {
    processTikTokPosts();
  });
};

/**
 * TikTok用MutationObserverを開始
 */
export const startTikTokObserver = (): void => {
  if (observer) {
    return;
  }

  console.log(`${SCRIPT_NAME} Starting TikTok Observer...`);

  // 初回スキャン
  processTikTokPosts();

  // DOM変更を監視
  observer = new MutationObserver((mutations) => {
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
