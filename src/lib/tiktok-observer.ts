/**
 * TikTok DOM監視 - FakeAdAlertDemo
 * TikTokフィードの動的コンテンツを監視
 * Phase 2
 */

import {
  detectAllTikTokPosts,
  detectTikTokProfile,
  isTikTokProfilePage,
  isTikTokVideoPage,
  getUsernameFromVideoUrl,
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

// 動画ページ処理済みマーカー
const VIDEO_PAGE_PROCESSED_ATTR = 'data-fakead-video-processed';
const VIDEO_BADGE_CLASS = 'fakead-tiktok-video-badge';
const VIDEO_WARNING_CLASS = 'fakead-tiktok-video-warning';

/**
 * 個別動画ページにバッジを挿入
 */
const insertVideoBadge = (
  anchorElement: HTMLElement,
  username: string,
  verification: { result: string }
): void => {
  // 既にバッジがあれば何もしない
  const parent = anchorElement.parentElement;
  if (!parent) return;
  if (parent.querySelector(`.${VIDEO_BADGE_CLASS}, .${VIDEO_WARNING_CLASS}`)) return;

  const badge = document.createElement('span');

  if (verification.result === 'verified') {
    badge.className = VIDEO_BADGE_CLASS;
    badge.innerHTML = '✅ VC認証済み';
  } else {
    badge.className = VIDEO_WARNING_CLASS;
    badge.innerHTML = '⚠️ 未認証アカウント';
  }

  // ユーザー名リンクの直後に挿入
  anchorElement.insertAdjacentElement('afterend', badge);
};

/**
 * 個別動画ページを処理
 */
const processTikTokVideoPage = (): void => {
  const username = getUsernameFromVideoUrl();
  if (!username) {
    console.log(`${SCRIPT_NAME} Video page: No username found`);
    return;
  }

  // 既に処理済みのバッジがあればスキップ
  if (document.querySelector(`.${VIDEO_BADGE_CLASS}, .${VIDEO_WARNING_CLASS}`)) {
    return;
  }

  // ユーザー名リンクを探す（/@username へのリンク）
  const usernameLink = document.querySelector(
    `a[href="/@${username}"] span, a[href="/@${username}"]`
  ) as HTMLElement | null;

  if (!usernameLink) {
    console.log(`${SCRIPT_NAME} Video page: Username link not found for @${username}`);
    return;
  }

  // リンク要素を取得（span の場合は親の a 要素を使う）
  const linkElement = usernameLink.tagName === 'A'
    ? usernameLink
    : (usernameLink.closest('a') || usernameLink);

  console.log(`${SCRIPT_NAME} Video page: Found username link for @${username}`);

  const verification = verifyAdvertiser(username);
  console.log(`${SCRIPT_NAME} TikTok Video: ${username} -> ${verification.result}`);

  // unknown の場合は何も表示しない
  if (verification.result === 'unknown') {
    return;
  }

  insertVideoBadge(linkElement as HTMLElement, username, verification);
};

/**
 * プロフィールページを処理
 */
const processTikTokProfile = (): void => {
  const profile = detectTikTokProfile();
  if (!profile) return;

  const verification = verifyAdvertiser(profile.username);
  console.log(`${SCRIPT_NAME} TikTok Profile: ${profile.username} -> ${verification.result}`);
  console.log(`${SCRIPT_NAME} Header: ${profile.headerElement ? 'found' : 'null/already processed'}, Grid items: ${profile.gridItems.length}`);

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

  // ヘッダーバッジ（verified または fake の場合のみ、まだ処理されていない場合）
  if (profile.headerElement) {
    showTikTokProfileBadge(profile.headerElement, profile.username, verification);
    markTikTokProfileProcessed(profile.headerElement);
  }

  // グリッドオーバーレイ（verified または fake の場合のみ）
  console.log(`${SCRIPT_NAME} Processing ${profile.gridItems.length} grid items...`);
  profile.gridItems.forEach((item, index) => {
    console.log(`${SCRIPT_NAME} Grid item ${index}:`, item.className);
    showTikTokGridOverlay(item, verification);
    markTikTokGridItemProcessed(item);
  });
};

/**
 * ページ種別に応じた処理を実行
 */
const processPage = (): void => {
  const isProfile = isTikTokProfilePage();
  const isVideo = isTikTokVideoPage();

  if (isProfile) {
    console.log(`${SCRIPT_NAME} Page type: TikTok profile`);
    processTikTokProfile();
  } else if (isVideo) {
    console.log(`${SCRIPT_NAME} Page type: TikTok video`);
    processTikTokVideoPage();
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
