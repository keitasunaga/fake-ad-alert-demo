/**
 * モーダル検出 - FakeAdAlertDemo
 * Instagram個別投稿モーダルの検出と監視
 */

const MODAL_PROCESSED_ATTR = 'data-fakead-modal-processed';

/**
 * モーダル情報
 */
export interface ModalInfo {
  username: string;
  modalElement: HTMLElement;
  headerElement: HTMLElement | null;
  mediaElement: HTMLElement | null;
}

/**
 * 個別投稿モーダルを検出
 */
export const detectModal = (): ModalInfo | null => {
  // モーダルの検出（role="dialog" または特定のクラス）
  const modal = document.querySelector('[role="dialog"] article') as HTMLElement;

  if (!modal || modal.hasAttribute(MODAL_PROCESSED_ATTR)) {
    return null;
  }

  // 投稿者名を取得
  const header = modal.querySelector('header');
  const nameElement = header?.querySelector('a span, span span');
  const username = nameElement?.textContent?.trim() || 'Unknown';

  // メディア要素
  const mediaElement = modal.querySelector('div > div > div') as HTMLElement;

  return {
    username,
    modalElement: modal,
    headerElement: header as HTMLElement | null,
    mediaElement,
  };
};

/**
 * モーダルを処理済みにマーク
 */
export const markModalProcessed = (element: HTMLElement): void => {
  element.setAttribute(MODAL_PROCESSED_ATTR, 'true');
};

/**
 * モーダルの開閉を監視
 */
export const observeModal = (callback: () => void): MutationObserver => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const hasDialog = document.querySelector('[role="dialog"]');
        if (hasDialog) {
          callback();
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
};
