/**
 * TikTok Content Script
 * Phase 2: TikTok対応
 */

import { startTikTokObserver, stopTikTokObserver } from '../lib/tiktok-observer';
import './styles/tiktok.css';

const SCRIPT_NAME = '[FakeAdAlertDemo]';

/**
 * 初期化処理
 */
const init = (): void => {
  console.log(`${SCRIPT_NAME} Initializing on TikTok (Demo Mode)...`);

  // DOM監視を開始
  startTikTokObserver();

  // ページ離脱時にクリーンアップ
  window.addEventListener('beforeunload', () => {
    stopTikTokObserver();
  });
};

/**
 * エントリーポイント
 */
const main = (): void => {
  console.log(`${SCRIPT_NAME} TikTok Content Script loaded (Demo Mode)`);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
};

main();
