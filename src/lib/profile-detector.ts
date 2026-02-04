/**
 * プロフィール検出 - FakeAdAlertDemo
 * Instagramプロフィールページの検出とバッジ表示用情報の抽出
 */

import { getUsernameFromUrl } from './page-router';

const PROFILE_PROCESSED_ATTR = 'data-fakead-profile-processed';
const GRID_PROCESSED_ATTR = 'data-fakead-grid-processed';

/**
 * プロフィール情報
 */
export interface ProfileInfo {
  username: string;
  headerElement: HTMLElement | null;
  gridItems: HTMLElement[];
}

/**
 * プロフィールページの情報を取得
 */
export const detectProfile = (): ProfileInfo | null => {
  const username = getUsernameFromUrl();
  if (!username) {
    return null;
  }

  // ヘッダー要素を取得
  const headerElement = document.querySelector('header section') as HTMLElement;

  // グリッドアイテムを取得
  const gridContainer = document.querySelector('article') ||
                        document.querySelector('main > div > div');
  const gridItems = gridContainer
    ? Array.from(gridContainer.querySelectorAll('a[href*="/p/"]')) as HTMLElement[]
    : [];

  // 処理済みでないアイテムのみ
  const unprocessedItems = gridItems.filter(
    item => !item.hasAttribute(GRID_PROCESSED_ATTR)
  );

  return {
    username,
    headerElement: headerElement?.hasAttribute(PROFILE_PROCESSED_ATTR)
      ? null
      : headerElement,
    gridItems: unprocessedItems,
  };
};

/**
 * プロフィールヘッダーを処理済みにマーク
 */
export const markProfileProcessed = (element: HTMLElement): void => {
  element.setAttribute(PROFILE_PROCESSED_ATTR, 'true');
};

/**
 * グリッドアイテムを処理済みにマーク
 */
export const markGridItemProcessed = (element: HTMLElement): void => {
  element.setAttribute(GRID_PROCESSED_ATTR, 'true');
};
