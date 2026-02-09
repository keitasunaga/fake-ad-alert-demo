/**
 * デモニュースサイトのバナー広告検出
 * Phase 5
 */

import type { AdInfo } from './types';

const PROCESSED_ATTR = 'data-fakead-processed';
const BANNER_SELECTOR = '.ad-banner[data-ad-slot]';

/**
 * ページ内の全バナー広告を検出
 */
export const detectNewsBanners = (): AdInfo[] => {
  const banners = document.querySelectorAll<HTMLElement>(BANNER_SELECTOR);
  const results: AdInfo[] = [];

  banners.forEach((banner) => {
    if (banner.getAttribute(PROCESSED_ATTR)) return;

    const advertiserName = banner.getAttribute('data-advertiser');
    if (!advertiserName) return;

    const imgElement = banner.querySelector<HTMLElement>('img');
    const linkElement = banner.querySelector<HTMLAnchorElement>('a');

    banner.setAttribute(PROCESSED_ATTR, 'true');

    results.push({
      element: banner,
      advertiserName,
      imageElement: imgElement ?? undefined,
      headerElement: linkElement ?? undefined,
    });
  });

  return results;
};
