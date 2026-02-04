/**
 * ページルーター - FakeAdAlertDemo
 * Instagram内のページ種別判定とURL変更監視
 */

/**
 * ページ種別
 */
export type PageType = 'home' | 'profile' | 'post' | 'other';

/**
 * 現在のページ種別を判定
 */
export const getPageType = (): PageType => {
  const path = window.location.pathname;

  // ホームフィード
  if (path === '/' || path === '/home/') {
    return 'home';
  }

  // 個別投稿 /p/{post_id}/
  if (path.match(/^\/p\/[\w-]+\/?$/)) {
    return 'post';
  }

  // プロフィールページ /{username}/
  // 除外: /p/, /explore/, /reels/, /stories/, /direct/
  if (path.match(/^\/[\w.]+\/?$/) &&
      !path.startsWith('/p/') &&
      !path.startsWith('/explore') &&
      !path.startsWith('/reels') &&
      !path.startsWith('/stories') &&
      !path.startsWith('/direct')) {
    return 'profile';
  }

  return 'other';
};

/**
 * URLからユーザー名を取得
 */
export const getUsernameFromUrl = (): string | null => {
  const path = window.location.pathname;
  const match = path.match(/^\/([\w.]+)\/?$/);
  return match ? match[1] : null;
};

/**
 * URL変更を監視
 */
export const observeUrlChanges = (callback: () => void): void => {
  // popstateイベント（ブラウザバック/フォワード）
  window.addEventListener('popstate', callback);

  // pushState/replaceStateをフック
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    callback();
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    callback();
  };
};
