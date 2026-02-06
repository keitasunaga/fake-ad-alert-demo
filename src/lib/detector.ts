/**
 * 広告検出 - FakeAdAlertDemo
 * Instagram DOM内から広告要素を検出
 */

import type { AdInfo } from './types';

// 処理済みマーカー
const PROCESSED_ATTR = 'data-fakead-processed';

/**
 * 要素が広告かどうかを判定
 */
export const isAdElement = (element: HTMLElement): boolean => {
  const text = element.textContent || '';
  return text.includes('広告') || text.includes('Sponsored');
};

/**
 * 広告要素から情報を抽出
 */
export const extractAdInfo = (articleElement: HTMLElement): AdInfo | null => {
  // 処理済みチェック
  if (articleElement.hasAttribute(PROCESSED_ATTR)) {
    return null;
  }

  // 広告ラベルを探す
  const hasAdLabel = isAdElement(articleElement);
  if (!hasAdLabel) {
    return null;
  }

  // 広告主名を取得
  const header = articleElement.querySelector('header');
  const nameElement = header?.querySelector('a span, span span');
  const advertiserName = nameElement?.textContent?.trim() || 'Unknown';

  // 画像/動画コンテナを取得
  const mediaContainer = articleElement.querySelector('div > div > div');

  // 処理済みマーク
  articleElement.setAttribute(PROCESSED_ATTR, 'true');

  return {
    element: articleElement,
    advertiserName,
    imageElement: mediaContainer as HTMLElement | undefined,
    headerElement: header as HTMLElement | undefined,
  };
};

/**
 * ページ内の全広告を検出
 */
export const detectAds = (): AdInfo[] => {
  const articles = document.querySelectorAll('article');
  const ads: AdInfo[] = [];

  articles.forEach((article) => {
    const adInfo = extractAdInfo(article as HTMLElement);
    if (adInfo) {
      ads.push(adInfo);
    }
  });

  return ads;
};

/**
 * デモモード: 投稿から情報を抽出（広告ラベル不要）
 */
export const extractPostInfo = (articleElement: HTMLElement): AdInfo | null => {
  // 処理済みチェック
  if (articleElement.hasAttribute(PROCESSED_ATTR)) {
    return null;
  }

  // 投稿者名を取得
  const header = articleElement.querySelector('header');
  let advertiserName = 'Unknown';

  // 方法1: article全体からプロフィールリンクのhrefを探す
  const allLinks = articleElement.querySelectorAll('a[href^="/"]');
  for (const link of allLinks) {
    const href = link.getAttribute('href');
    // ユーザープロフィールリンクのパターン: /{username}/
    const match = href?.match(/^\/([a-zA-Z0-9._]+)\/?$/);
    if (match) {
      const candidate = match[1];
      // 除外パターン
      if (candidate !== 'p' && candidate !== 'reel' && candidate !== 'reels' &&
          candidate !== 'explore' && candidate !== 'stories' && candidate !== 'direct') {
        advertiserName = candidate;
        break;
      }
    }
  }

  // 方法2: ヘッダー内のspanテキストから取得
  if (advertiserName === 'Unknown' && header) {
    const spans = header.querySelectorAll('span');
    for (const span of spans) {
      const text = span.textContent?.trim();
      // ユーザー名らしいパターン（英数字、ドット、アンダースコアのみ、スペースなし）
      if (text && /^[a-zA-Z0-9._]+$/.test(text) && text.length >= 2 && text.length < 30) {
        advertiserName = text;
        break;
      }
    }
  }

  // 画像/動画コンテナを取得
  const mediaContainer = articleElement.querySelector('div > div > div');

  // 処理済みマーク
  articleElement.setAttribute(PROCESSED_ATTR, 'true');

  return {
    element: articleElement,
    advertiserName,
    imageElement: mediaContainer as HTMLElement | undefined,
    headerElement: header as HTMLElement | undefined,
  };
};

/**
 * デモモード: 全投稿を検出（広告ラベル不要）
 * モーダル内の記事は除外（モーダル専用の処理で対応）
 */
export const detectAllPosts = (): AdInfo[] => {
  // モーダル外のarticleのみを対象にする
  const articles = document.querySelectorAll('article:not([role="dialog"] article)');
  const posts: AdInfo[] = [];

  articles.forEach((article) => {
    // モーダル内の記事は除外（二重チェック）
    if (article.closest('[role="dialog"]')) {
      return;
    }
    const postInfo = extractPostInfo(article as HTMLElement);
    if (postInfo) {
      posts.push(postInfo);
    }
  });

  return posts;
};
