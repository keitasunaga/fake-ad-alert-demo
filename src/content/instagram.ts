/**
 * Instagram Content Script
 * Phase 0: 動作確認用の雛形
 */

// モジュールとして扱うためのexport
export {};

const SCRIPT_NAME = '[FakeAdAlertDemo]';

/**
 * 初期化処理
 */
const init = (): void => {
  console.log(`${SCRIPT_NAME} Initializing on Instagram...`);

  // TODO: Phase 1で広告検出ロジックを実装
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
