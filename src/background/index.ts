/**
 * Background Script (Service Worker)
 * Phase 3: 検出情報の保存
 */

import type { DetectedAdInfo } from '../lib/vc-types';

// モジュールとして扱うためのexport
export {};

const SCRIPT_NAME = '[FakeAdAlertDemo]';
const STORAGE_KEY = 'lastDetectedAd';

// 拡張機能インストール時の処理
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`${SCRIPT_NAME} Extension installed:`, details.reason);
  chrome.storage.session.remove(STORAGE_KEY);
});

// Content Scriptからのメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`${SCRIPT_NAME} Message received:`, message);
  console.log(`${SCRIPT_NAME} From:`, sender.tab?.url);

  if (message.type === 'AD_DETECTED') {
    const adInfo: DetectedAdInfo = {
      advertiserName: message.advertiserName,
      platform: message.platform,
      result: message.result,
      matchedPattern: message.matchedPattern,
      listType: message.listType,
      detectedAt: new Date().toISOString(),
    };

    chrome.storage.session.set({ [STORAGE_KEY]: adInfo }).then(() => {
      console.log(`${SCRIPT_NAME} Stored detected ad:`, adInfo);
      sendResponse({ status: 'ok' });
    });
    return true; // 非同期レスポンスを有効化
  }

  sendResponse({ status: 'unknown' });
  return true;
});

console.log(`${SCRIPT_NAME} Background Script loaded`);
