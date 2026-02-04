/**
 * 判定ロジック - FakeAdAlertDemo
 * 広告主名をホワイトリスト/ブラックリストと照合
 */

import type { VerificationInfo } from './types';
import { getConfig } from './config-loader';

/**
 * 広告主名を判定する
 */
export const verifyAdvertiser = (advertiserName: string): VerificationInfo => {
  const config = getConfig();
  const lowerName = advertiserName.toLowerCase();

  // ホワイトリストチェック
  for (const advertiser of config.whitelist) {
    for (const pattern of advertiser.patterns) {
      if (lowerName.includes(pattern.toLowerCase())) {
        return {
          result: 'verified',
          advertiserName,
          matchedPattern: pattern,
          listType: 'whitelist',
        };
      }
    }
  }

  // ブラックリストチェック
  for (const advertiser of config.blacklist) {
    for (const pattern of advertiser.patterns) {
      if (lowerName.includes(pattern.toLowerCase())) {
        return {
          result: 'fake',
          advertiserName,
          matchedPattern: pattern,
          listType: 'blacklist',
        };
      }
    }
  }

  // どちらにもマッチしない場合は未検証（警告表示）
  return {
    result: 'unknown',
    advertiserName,
  };
};
