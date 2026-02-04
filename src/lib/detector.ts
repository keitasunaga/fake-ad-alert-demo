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

  // 投稿者名を取得（プロフィールリンクのhrefから抽出 - 最も確実）
  const header = articleElement.querySelector('header');
  let advertiserName = 'Unknown';

  // 方法1: プロフィールリンクのhrefから取得
  const profileLinks = header?.querySelectorAll('a[href^="/"]') || [];
  for (const link of profileLinks) {
    const href = link.getAttribute('href');
    // ユーザープロフィールリンクのパターン: /{username}/
    const match = href?.match(/^\/([a-zA-Z0-9._]+)\/?$/);
    if (match && match[1] !== 'p' && match[1] !== 'reel' && match[1] !== 'explore') {
      advertiserName = match[1];
      break;
    }
  }

  // 方法2: フォールバック - spanのテキストから取得
  if (advertiserName === 'Unknown') {
    const nameElement = header?.querySelector('a span, span span');
    const text = nameElement?.textContent?.trim();
    if (text && !text.includes(' ') && text.length < 30) {
      advertiserName = text;
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
