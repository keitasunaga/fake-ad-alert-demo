/**
 * 型定義 - FakeAdAlertDemo
 * Phase 1: 広告検出・判定・UI表示
 */

/**
 * 判定結果
 */
export type VerificationResult = 'verified' | 'fake' | 'unknown';

/**
 * 広告情報
 */
export interface AdInfo {
  element: HTMLElement;        // 広告のルート要素
  advertiserName: string;      // 広告主名
  imageElement?: HTMLElement;  // 広告画像/動画要素
  headerElement?: HTMLElement; // ヘッダー要素（バッジ表示用）
}

/**
 * 判定結果（詳細）
 */
export interface VerificationInfo {
  result: VerificationResult;
  advertiserName: string;
  matchedPattern?: string;
  listType?: 'whitelist' | 'blacklist';
}

/**
 * 広告主設定
 */
export interface AdvertiserConfig {
  name: string;
  patterns: string[];
}

/**
 * 設定ファイル構造
 */
export interface AdVerificationConfig {
  whitelist: AdvertiserConfig[];
  blacklist: AdvertiserConfig[];
}
