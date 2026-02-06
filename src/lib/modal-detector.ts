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

  // 投稿者名を取得（プロフィールリンクから抽出）
  const header = modal.querySelector('header');
  let username = 'Unknown';

  // 方法1: プロフィールリンクのhrefから取得（最も確実）
  const profileLink = header?.querySelector('a[href^="/"][role="link"]') as HTMLAnchorElement;
  if (profileLink) {
    const href = profileLink.getAttribute('href');
    const match = href?.match(/^\/([^/]+)\/?$/);
    if (match) {
      username = match[1];
    }
  }

  // 方法2: フォールバック - 最初のリンク内のテキスト
  if (username === 'Unknown') {
    const firstLink = header?.querySelector('a[href^="/"]');
    const linkText = firstLink?.textContent?.trim();
    if (linkText && !linkText.includes(' ') && linkText.length < 30) {
      username = linkText;
    }
  }

  // メディア要素（画像/動画のコンテナ）
  const mediaElement = modal.querySelector('div[role="button"] img, video')?.parentElement as HTMLElement;

  console.log(`[FakeAdAlertDemo] Modal detected - username: ${username}`);

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
