/**
 * Background Script (Service Worker)
 * Phase 6: マルチVC対応（配列管理）
 */

import type { DetectedItem } from '../lib/vc-types';

// モジュールとして扱うためのexport
export {};

const SCRIPT_NAME = '[FakeAdAlertDemo]';
const STORAGE_KEY = 'detectedItems';

// ── サイドパネル設定 ──

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.warn(`${SCRIPT_NAME} setPanelBehavior failed:`, err));

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id }).catch((err) => {
      console.warn(`${SCRIPT_NAME} sidePanel.open failed:`, err);
    });
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  console.log(`${SCRIPT_NAME} Extension installed:`, details.reason);
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.warn(`${SCRIPT_NAME} setPanelBehavior onInstalled:`, err));
  chrome.storage.session.remove(STORAGE_KEY);
});

chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.warn(`${SCRIPT_NAME} setPanelBehavior onStartup:`, err));
});

// ── ストレージヘルパー ──

const getDetectedItems = async (): Promise<DetectedItem[]> => {
  const result = await chrome.storage.session.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as DetectedItem[]) ?? [];
};

const setDetectedItems = async (items: DetectedItem[]): Promise<void> => {
  await chrome.storage.session.set({ [STORAGE_KEY]: items });
};

// ── メッセージキュー（並行書き込みによるレースコンディション防止） ──

let processingQueue: Promise<void> = Promise.resolve();

const enqueue = (fn: () => Promise<void>): Promise<void> => {
  processingQueue = processingQueue.then(fn).catch((err) => {
    console.error(`${SCRIPT_NAME} Queue error:`, err);
  });
  return processingQueue;
};

// ── メッセージハンドラ ──

const handleSiteDetected = async (message: {
  siteName: string;
  platform: 'instagram' | 'tiktok' | 'news-site';
}): Promise<void> => {
  const items = await getDetectedItems();

  // 既にサイトVCがあれば何もしない
  if (items.some((item) => item.type === 'site')) return;

  const siteItem: DetectedItem = {
    id: `site-${Date.now()}`,
    type: 'site',
    advertiserName: message.siteName,
    platform: message.platform,
    result: 'verified',
    detectedAt: new Date().toISOString(),
  };

  await setDetectedItems([siteItem, ...items]);
  console.log(`${SCRIPT_NAME} Stored site VC:`, siteItem);
};

const handleAdDetected = async (message: {
  advertiserName: string;
  platform: 'instagram' | 'tiktok' | 'news-site';
  result: 'verified' | 'fake' | 'unknown';
  matchedPattern?: string;
  listType?: string;
}): Promise<void> => {
  const items = await getDetectedItems();

  // 同じ広告主名の重複チェック
  if (items.some((item) => item.type === 'ad' && item.advertiserName === message.advertiserName)) {
    return;
  }

  const adItem: DetectedItem = {
    id: `ad-${items.length}-${Date.now()}`,
    type: 'ad',
    advertiserName: message.advertiserName,
    platform: message.platform,
    result: message.result,
    matchedPattern: message.matchedPattern,
    listType: message.listType,
    detectedAt: new Date().toISOString(),
  };

  await setDetectedItems([...items, adItem]);
  console.log(`${SCRIPT_NAME} Stored detected ad:`, adItem);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`${SCRIPT_NAME} Message received:`, message);
  console.log(`${SCRIPT_NAME} From:`, sender.tab?.url);

  if (message.type === 'SITE_DETECTED') {
    enqueue(() => handleSiteDetected(message)).then(() => sendResponse({ status: 'ok' }));
    return true;
  }

  if (message.type === 'AD_DETECTED') {
    enqueue(() => handleAdDetected(message)).then(() => sendResponse({ status: 'ok' }));
    return true;
  }

  sendResponse({ status: 'unknown' });
  return true;
});

// ── タブ遷移時のクリア ──

chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.storage.session.remove(STORAGE_KEY);
  }
});

console.log(`${SCRIPT_NAME} Background Script loaded (Phase 6)`);
