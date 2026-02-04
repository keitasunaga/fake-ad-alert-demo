/**
 * Instagram Content Script
 * Phase 1: 広告検出・判定・UI表示
 */

import { startObserver, stopObserver } from '../lib/observer';
import './styles/instagram.css';

const SCRIPT_NAME = '[FakeAdAlertDemo]';

/**
 * 初期化処理
 */
const init = (): void => {
  console.log(`${SCRIPT_NAME} Initializing on Instagram...`);

  // DOM監視を開始
  startObserver();

  // ページ離脱時にクリーンアップ
  window.addEventListener('beforeunload', () => {
    stopObserver();
  });
};

/**
 * エントリーポイント
 */
const main = (): void => {
  console.log(`${SCRIPT_NAME} Instagram Content Script loaded`);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
};

main();
