/**
 * Instagram Content Script
 * Phase 1.5: デモモード対応
 */

import { getPageType, observeUrlChanges } from '../lib/page-router';
import { detectAllPosts } from '../lib/detector';
import { detectProfile, markProfileProcessed, markGridItemProcessed } from '../lib/profile-detector';
import { detectModal, markModalProcessed, observeModal } from '../lib/modal-detector';
import { verifyAdvertiser } from '../lib/verifier';
import { showWarningOverlay } from '../components/warning-overlay';
import { showVerifiedBadge } from '../components/verified-badge';
import { showProfileBadge } from '../components/profile-badge';
import { showGridOverlay } from '../components/grid-overlay';
import { showModalBadge, showModalOverlay } from '../components/modal-badge';
import './styles/instagram.css';

const SCRIPT_NAME = '[FakeAdAlertDemo]';

/**
 * ホームフィードの処理
 */
const processHomeFeed = (): void => {
  const posts = detectAllPosts();

  posts.forEach((post) => {
    const verification = verifyAdvertiser(post.advertiserName);
    console.log(`${SCRIPT_NAME} Post: ${post.advertiserName} -> ${verification.result}`);

    if (verification.result === 'verified') {
      showVerifiedBadge(post);
    } else {
      showWarningOverlay(post, verification);
    }
  });
};

/**
 * プロフィールページの処理
 */
const processProfilePage = (): void => {
  const profile = detectProfile();
  if (!profile) return;

  const verification = verifyAdvertiser(profile.username);
  console.log(`${SCRIPT_NAME} Profile: ${profile.username} -> ${verification.result}`);

  // ヘッダーバッジ
  if (profile.headerElement) {
    showProfileBadge(profile.headerElement, verification);
    markProfileProcessed(profile.headerElement);
  }

  // グリッドオーバーレイ
  profile.gridItems.forEach((item) => {
    showGridOverlay(item, verification);
    markGridItemProcessed(item);
  });
};

/**
 * モーダルの処理
 */
const processModal = (): void => {
  const modal = detectModal();
  if (!modal) return;

  const verification = verifyAdvertiser(modal.username);
  console.log(`${SCRIPT_NAME} Modal: ${modal.username} -> ${verification.result}`);

  if (modal.headerElement) {
    showModalBadge(modal.headerElement, verification);
  }

  if (modal.mediaElement) {
    showModalOverlay(modal.mediaElement, verification);
  }

  markModalProcessed(modal.modalElement);
};

/**
 * ページ種別に応じた処理を実行
 */
const processPage = (): void => {
  const pageType = getPageType();
  console.log(`${SCRIPT_NAME} Page type: ${pageType}`);

  switch (pageType) {
    case 'home':
      processHomeFeed();
      break;
    case 'profile':
      processProfilePage();
      break;
    case 'post':
      // 個別投稿ページ（直接アクセス時）
      processHomeFeed(); // articleがあれば処理
      break;
  }
};

/**
 * 初期化処理
 */
const init = (): void => {
  console.log(`${SCRIPT_NAME} Initializing (Demo Mode)...`);

  // 初回処理
  processPage();

  // URL変更を監視（SPA対応）
  observeUrlChanges(() => {
    console.log(`${SCRIPT_NAME} URL changed`);
    setTimeout(processPage, 500); // DOM更新を待つ
  });

  // モーダルを監視
  observeModal(() => {
    setTimeout(processModal, 300);
  });

  // DOM変更を監視（スクロールで追加される要素用）
  const observer = new MutationObserver(() => {
    requestAnimationFrame(processPage);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // ページ離脱時にクリーンアップ
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
};

/**
 * エントリーポイント
 */
const main = (): void => {
  console.log(`${SCRIPT_NAME} Instagram Content Script loaded (Demo Mode)`);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
};

main();
