/**
 * Background Script (Service Worker)
 * Phase 0: 動作確認用の雛形
 */

// モジュールとして扱うためのexport
export {};

const SCRIPT_NAME = '[FakeAdAlertDemo]';

// 拡張機能インストール時の処理
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`${SCRIPT_NAME} Extension installed:`, details.reason);
});

// Content Scriptからのメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`${SCRIPT_NAME} Message received:`, message);
  console.log(`${SCRIPT_NAME} From:`, sender.tab?.url);

  // TODO: Phase 1以降でメッセージハンドリングを実装
  sendResponse({ status: 'ok' });
  return true; // 非同期レスポンスを有効化
});

console.log(`${SCRIPT_NAME} Background Script loaded`);
