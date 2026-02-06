/**
 * TikTok広告検出 - FakeAdAlertDemo
 * TikTok DOM内から広告要素を検出
 * Phase 2
 */

import type { AdInfo } from './types';

// TikTok広告を示すセレクタ（変更される可能性あり）
const TIKTOK_SELECTORS = {
  // 動画コンテナ（For Youフィード）
  videoContainer: '[data-e2e="recommend-list-item-container"], .tiktok-web-player, [class*="DivItemContainerV2"]',
  // 広告ラベル
  adLabel: '[data-e2e="ad-label"], [class*="SpanAdBadge"]',
  // 広告主名（ユーザー名）
  advertiserName: '[data-e2e="video-author-uniqueid"], [data-e2e="browse-username"], a[href^="/@"] span, [class*="StyledAuthorAnchor"]',
  // 動画要素
  videoElement: 'video',
  // ユーザー情報エリア
  userInfo: '[data-e2e="video-author-container"], [data-e2e="browse-user-info"], [class*="DivInfoContainer"]',
} as const;

// 処理済みマーカー
const PROCESSED_ATTR = 'data-fakead-tiktok-processed';

/**
 * 要素が広告かどうかを判定
 */
export const isTikTokAdElement = (element: HTMLElement): boolean => {
  const text = element.textContent || '';
  return (
    text.includes('広告') ||
    text.includes('Sponsored') ||
    text.includes('プロモーション') ||
    text.includes('Ad') ||
    element.querySelector('[data-e2e="ad-label"]') !== null ||
    element.querySelector('[class*="SpanAdBadge"]') !== null
  );
};

/**
 * TikTok広告要素から情報を抽出
 */
export const extractTikTokAdInfo = (videoContainer: HTMLElement): AdInfo | null => {
  // 処理済みチェック
  if (videoContainer.hasAttribute(PROCESSED_ATTR)) {
    return null;
  }

  // 広告ラベルを探す
  if (!isTikTokAdElement(videoContainer)) {
    return null;
  }

  // 広告主名を取得
  let advertiserName = 'Unknown';

  // 方法1: data-e2eセレクタから取得
  const authorElement = videoContainer.querySelector(TIKTOK_SELECTORS.advertiserName);
  if (authorElement) {
    advertiserName = authorElement.textContent?.trim()?.replace('@', '') || 'Unknown';
  }

  // 方法2: hrefから取得
  if (advertiserName === 'Unknown') {
    const userLink = videoContainer.querySelector('a[href^="/@"]') as HTMLAnchorElement;
    if (userLink) {
      const href = userLink.getAttribute('href');
      const match = href?.match(/^\/@([^/?]+)/);
      if (match) {
        advertiserName = match[1];
      }
    }
  }

  // 動画要素を取得
  const videoElement = videoContainer.querySelector('video');

  // ユーザー情報エリアを取得
  const userInfoElement = videoContainer.querySelector(TIKTOK_SELECTORS.userInfo);

  // 処理済みマーク
  videoContainer.setAttribute(PROCESSED_ATTR, 'true');

  return {
    element: videoContainer,
    advertiserName,
    imageElement: videoElement?.parentElement as HTMLElement | undefined,
    headerElement: userInfoElement as HTMLElement | undefined,
  };
};

/**
 * ページ内の全TikTok広告を検出
 */
export const detectTikTokAds = (): AdInfo[] => {
  const videoContainers = document.querySelectorAll(TIKTOK_SELECTORS.videoContainer);
  const ads: AdInfo[] = [];

  videoContainers.forEach((container) => {
    const adInfo = extractTikTokAdInfo(container as HTMLElement);
    if (adInfo) {
      ads.push(adInfo);
    }
  });

  return ads;
};

/**
 * デモモード: 全投稿を検出（広告ラベル不要）
 */
export const extractTikTokPostInfo = (videoContainer: HTMLElement): AdInfo | null => {
  // 処理済みチェック
  if (videoContainer.hasAttribute(PROCESSED_ATTR)) {
    return null;
  }

  // 投稿者名を取得
  let advertiserName = 'Unknown';

  // 方法1: data-e2eセレクタから取得
  const authorElement = videoContainer.querySelector(TIKTOK_SELECTORS.advertiserName);
  if (authorElement) {
    advertiserName = authorElement.textContent?.trim()?.replace('@', '') || 'Unknown';
  }

  // 方法2: hrefから取得
  if (advertiserName === 'Unknown') {
    const userLink = videoContainer.querySelector('a[href^="/@"]') as HTMLAnchorElement;
    if (userLink) {
      const href = userLink.getAttribute('href');
      const match = href?.match(/^\/@([^/?]+)/);
      if (match) {
        advertiserName = match[1];
      }
    }
  }

  // 動画要素を取得
  const videoElement = videoContainer.querySelector('video');

  // ユーザー情報エリアを取得
  const userInfoElement = videoContainer.querySelector(TIKTOK_SELECTORS.userInfo);

  // 処理済みマーク
  videoContainer.setAttribute(PROCESSED_ATTR, 'true');

  return {
    element: videoContainer,
    advertiserName,
    imageElement: videoElement?.parentElement as HTMLElement | undefined,
    headerElement: userInfoElement as HTMLElement | undefined,
  };
};

/**
 * デモモード: 全投稿を検出
 */
export const detectAllTikTokPosts = (): AdInfo[] => {
  const videoContainers = document.querySelectorAll(TIKTOK_SELECTORS.videoContainer);
  const posts: AdInfo[] = [];

  videoContainers.forEach((container) => {
    const postInfo = extractTikTokPostInfo(container as HTMLElement);
    if (postInfo) {
      posts.push(postInfo);
    }
  });

  return posts;
};
