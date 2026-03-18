/**
 * Background Script (Service Worker)
 * Phase 6: マルチVC対応（配列管理）
 * Phase 7: リアルVC検証（Verify API連携）
 */

import type { DetectedItem, VCVerificationResponse, VerificationState } from '../lib/vc-types';

// モジュールとして扱うためのexport
export {};

const SCRIPT_NAME = '[FakeAdAlertDemo]';
const STORAGE_KEY = 'detectedItems';

// ── Phase 7: Verify API設定 ──

const VERIFY_API_URL = 'https://zero-engine-review.vericerts.io/v1/vc/verify';
const VERIFY_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5分

// 重複検証回避キャッシュ（Service Worker存続中のみ有効）
const verificationCache = new Map<string, {
  result: VCVerificationResponse;
  timestamp: number;
}>();

const getCacheKey = (vcRaw: string): string => vcRaw.substring(0, 128);

const updateVerificationState = async (
  tabId: number,
  state: VerificationState,
): Promise<void> => {
  const key = `vcVerification_${tabId}`;
  await chrome.storage.session.set({ [key]: state });
};

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

// ── Phase 7: VC検証ハンドラ ──

const handleVCDetected = async (
  tabId: number,
  message: { vcRaw: string; format: string; elementId: string; url: string },
): Promise<void> => {
  const { vcRaw } = message;

  // キャッシュチェック
  const cacheKey = getCacheKey(vcRaw);
  const cached = verificationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`${SCRIPT_NAME} VC verification cache hit`);
    await updateVerificationState(tabId, {
      status: 'verified',
      result: cached.result,
    });
    return;
  }

  // 検証中ステータスを即座に保存
  await updateVerificationState(tabId, { status: 'verifying' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

    const response = await fetch(VERIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vc: vcRaw }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('検証リクエストが上限に達しました');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const result: VCVerificationResponse = await response.json();

    // キャッシュに保存
    verificationCache.set(cacheKey, { result, timestamp: Date.now() });

    await updateVerificationState(tabId, {
      status: 'verified',
      result,
    });
    console.log(`${SCRIPT_NAME} VC verified:`, result.valid);
  } catch (error) {
    const errorMessage =
      error instanceof DOMException && error.name === 'AbortError'
        ? '検証がタイムアウトしました'
        : error instanceof TypeError
          ? '検証サーバーに接続できません'
          : `検証エラー: ${(error as Error).message}`;

    console.error(`${SCRIPT_NAME} VC verification failed:`, errorMessage);
    await updateVerificationState(tabId, {
      status: 'error',
      errorMessage,
    });
  }
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

  if (message.type === 'VC_DETECTED') {
    const tabId = sender.tab?.id;
    if (tabId) {
      handleVCDetected(tabId, message).then(() => sendResponse({ status: 'ok' }));
    } else {
      sendResponse({ status: 'error', message: 'no tab id' });
    }
    return true;
  }

  sendResponse({ status: 'unknown' });
  return true;
});

// ── タブ遷移時のクリア ──

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.storage.session.remove(STORAGE_KEY);
    chrome.storage.session.remove(`vcVerification_${tabId}`);
  }
});

console.log(`${SCRIPT_NAME} Background Script loaded (Phase 7)`);
