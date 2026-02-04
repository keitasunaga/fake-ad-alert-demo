/**
 * 設定読み込み - FakeAdAlertDemo
 * YAMLファイルから広告主リストを読み込む
 */

import yaml from 'js-yaml';
import type { AdVerificationConfig } from './types';

// 設定ファイルの内容（ビルド時に埋め込み）
import configYaml from '../../config/ad-verification.yml?raw';

/**
 * 設定ファイルを読み込む
 */
export const loadConfig = (): AdVerificationConfig => {
  try {
    const config = yaml.load(configYaml) as AdVerificationConfig;
    return config;
  } catch (error) {
    console.error('[FakeAdAlertDemo] Failed to load config:', error);
    return { whitelist: [], blacklist: [] };
  }
};

/**
 * シングルトンで設定を保持
 */
let cachedConfig: AdVerificationConfig | null = null;

export const getConfig = (): AdVerificationConfig => {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
};
