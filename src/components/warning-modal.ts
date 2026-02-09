/**
 * 警告モーダル - フェイクバナークリック時の確認ダイアログ
 * Phase 5: ダークテーマ + グラスモーフィズム
 */

interface WarningModalOptions {
  advertiserName: string;
  matchedPattern?: string;
  listType?: string;
  originalUrl: string;
}

const MODAL_CLASS = 'fakead-warning-modal';

/**
 * 警告モーダルを表示
 */
export const showWarningModal = (options: WarningModalOptions): void => {
  // 既存モーダルがあれば削除
  const existing = document.querySelector(`.${MODAL_CLASS}-backdrop`);
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = `${MODAL_CLASS}-backdrop`;

  const listTypeLabel = options.listType === 'blacklist'
    ? 'ブラックリスト'
    : '未認証';

  backdrop.innerHTML = `
    <div class="${MODAL_CLASS}">
      <div class="${MODAL_CLASS}__icon">⚠️</div>
      <h2 class="${MODAL_CLASS}__title">この広告はVC未認証です</h2>
      <p class="${MODAL_CLASS}__description">
        この広告にはVerifiable Credentialによる認証がありません。<br>
        詐欺サイトに誘導される可能性があります。
      </p>
      <div class="${MODAL_CLASS}__details">
        <div class="${MODAL_CLASS}__detail-row">
          <span class="${MODAL_CLASS}__detail-label">広告主</span>
          <span class="${MODAL_CLASS}__detail-value">${options.advertiserName}</span>
        </div>
        <div class="${MODAL_CLASS}__detail-row">
          <span class="${MODAL_CLASS}__detail-label">判定</span>
          <span class="${MODAL_CLASS}__detail-value">${listTypeLabel}</span>
        </div>
        ${options.matchedPattern ? `
        <div class="${MODAL_CLASS}__detail-row">
          <span class="${MODAL_CLASS}__detail-label">マッチパターン</span>
          <span class="${MODAL_CLASS}__detail-value">${options.matchedPattern}</span>
        </div>
        ` : ''}
      </div>
      <div class="${MODAL_CLASS}__actions">
        <button class="${MODAL_CLASS}__btn-safe" data-action="safe">
          🛡️ 安全なページに戻る
        </button>
        <button class="${MODAL_CLASS}__btn-proceed" data-action="proceed">
          リスクを理解して進む →
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  // ボタンイベント
  const safeBtn = backdrop.querySelector('[data-action="safe"]');
  const proceedBtn = backdrop.querySelector('[data-action="proceed"]');

  safeBtn?.addEventListener('click', () => {
    backdrop.remove();
  });

  proceedBtn?.addEventListener('click', () => {
    backdrop.remove();
    window.open(options.originalUrl, '_blank');
  });

  // 背景クリックでもモーダルを閉じる
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.remove();
    }
  });
};
