/**
 * Popup Script - FakeAdAlertDemo
 * Phase 3: 検出情報の読み取りとVC情報の表示
 */

import type { DetectedAdInfo, VCInfo } from '../lib/vc-types';
import { getVCInfo } from '../lib/vc-mock';

const STORAGE_KEY = 'lastDetectedAd';

/**
 * 展開可能カードのHTML生成
 */
const createExpandableCard = (
  icon: string,
  title: string,
  content: string,
  defaultExpanded = false
): string => {
  return `
    <div class="card ${defaultExpanded ? 'card-expanded' : ''}">
      <div class="card-header">
        <span class="card-icon">${icon}</span>
        <span class="card-title">${title}</span>
        <span class="card-chevron">&#x25BC;</span>
      </div>
      <div class="card-content">
        ${content}
      </div>
    </div>
  `;
};

/**
 * InfoRow生成
 */
const createInfoRow = (
  label: string,
  value: string,
  options?: { isCode?: boolean; isValid?: boolean }
): string => {
  let valueHtml = value;
  if (options?.isCode) {
    valueHtml = `<span class="code-value">${value}</span>`;
  }
  if (options?.isValid !== undefined) {
    const icon = options.isValid ? '&#x2713;' : '&#x2717;';
    const cls = options.isValid ? 'valid' : 'invalid';
    valueHtml = `<span class="status-${cls}">${icon}</span>`;
  }
  return `
    <div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-value">${valueHtml}</span>
    </div>
  `;
};

/**
 * プラットフォーム名の日本語表示
 */
const platformLabel = (platform: string): string => {
  return platform === 'instagram' ? 'Instagram' : 'TikTok';
};

/**
 * 認証済み広告のUI生成
 */
const renderVerifiedAd = (detected: DetectedAdInfo, vcInfo: VCInfo): string => {
  const advertiserCard = createExpandableCard('&#x1F4CB;', '広告情報', `
    ${createInfoRow('広告主', vcInfo.advertiserInfo.name)}
    ${createInfoRow('広告主DID', vcInfo.advertiserInfo.advertiserDid, { isCode: true })}
    ${createInfoRow('カテゴリ', vcInfo.advertiserInfo.category)}
    ${createInfoRow('プラットフォーム', platformLabel(detected.platform))}
  `, true);

  const statusCard = createExpandableCard('&#x2713;', '検証ステータス', `
    ${createInfoRow('発行者の署名', '', { isValid: vcInfo.verificationStatus.issuerSignature })}
    ${createInfoRow('有効期限', '', { isValid: vcInfo.verificationStatus.expiration })}
    ${createInfoRow('失効状態', '', { isValid: vcInfo.verificationStatus.revocationStatus })}
    ${createInfoRow('トラストレジストリ', '', { isValid: vcInfo.verificationStatus.trustRegistry })}
    ${createInfoRow('ブロックチェーン', '', { isValid: vcInfo.verificationStatus.blockchain })}
  `);

  const trustChainCard = createExpandableCard('&#x1F517;', '信頼チェーン', `
    <div class="trust-chain">
      <div class="trust-entity trust-root">
        <div class="trust-name">${vcInfo.trustChain.root.name}</div>
        <div class="trust-role">${vcInfo.trustChain.root.role}</div>
        ${vcInfo.trustChain.root.did ? `<div class="trust-did">${vcInfo.trustChain.root.did}</div>` : ''}
      </div>
      <div class="trust-arrow">&#x2193;</div>
      <div class="trust-entity trust-intermediate">
        <div class="trust-name">${vcInfo.trustChain.intermediate.name}</div>
        <div class="trust-role">${vcInfo.trustChain.intermediate.role}</div>
        ${vcInfo.trustChain.intermediate.did ? `<div class="trust-did">${vcInfo.trustChain.intermediate.did}</div>` : ''}
      </div>
      <div class="trust-arrow">&#x2193;</div>
      <div class="trust-entity trust-subject">
        <div class="trust-name">${vcInfo.trustChain.subject.name}</div>
        <div class="trust-role">${vcInfo.trustChain.subject.role}</div>
        ${vcInfo.trustChain.subject.did ? `<div class="trust-did">${vcInfo.trustChain.subject.did}</div>` : ''}
      </div>
    </div>
  `);

  const blockchainCard = createExpandableCard('&#x26D3;&#xFE0F;', 'ブロックチェーン証明', `
    ${createInfoRow('Network', vcInfo.blockchainProof.network)}
    ${createInfoRow('TxHash', vcInfo.blockchainProof.transactionHash, { isCode: true })}
    ${createInfoRow('Contract', vcInfo.blockchainProof.contractAddress, { isCode: true })}
  `);

  return `
    <div class="result-header result-success">
      <span class="result-icon">&#x2705;</span>
      <span class="result-text">検証完了 - 証明書は有効です</span>
    </div>
    ${advertiserCard}
    ${statusCard}
    ${trustChainCard}
    ${blockchainCard}
  `;
};

/**
 * フェイク広告のUI生成
 */
const renderFakeAd = (detected: DetectedAdInfo): string => {
  return `
    <div class="result-header result-danger">
      <span class="result-icon">&#x26A0;&#xFE0F;</span>
      <span class="result-text">フェイク広告の可能性</span>
    </div>
    <div class="fake-details">
      <div class="fake-detail-row">
        <span class="fake-detail-label">有効なVCが見つかりませんでした</span>
      </div>
      <div class="fake-detail-row">
        <span class="fake-detail-label">広告主</span>
        <span class="fake-detail-value">${detected.advertiserName}</span>
      </div>
      <div class="fake-detail-row">
        <span class="fake-detail-label">プラットフォーム</span>
        <span class="fake-detail-value">${platformLabel(detected.platform)}</span>
      </div>
      ${detected.matchedPattern ? `
      <div class="fake-detail-row">
        <span class="fake-detail-label">マッチパターン</span>
        <span class="fake-detail-value">${detected.listType === 'blacklist' ? 'ブラックリスト' : detected.matchedPattern}</span>
      </div>
      ` : ''}
    </div>
  `;
};

/**
 * 未検出時のUI生成
 */
const renderNoDetection = (): string => {
  return `
    <div class="result-header result-info">
      <span class="result-icon">&#x2139;&#xFE0F;</span>
      <span class="result-text">SNSページで広告を検出すると<br>ここにVC検証情報が表示されます</span>
    </div>
  `;
};

/**
 * メインUI更新
 */
const updateUI = async (): Promise<void> => {
  const result = await chrome.storage.session.get(STORAGE_KEY);
  const detected = result[STORAGE_KEY] as DetectedAdInfo | undefined;
  const container = document.getElementById('vc-content');
  if (!container) return;

  if (!detected) {
    container.innerHTML = renderNoDetection();
    return;
  }

  if (detected.result === 'verified') {
    const vcInfo = getVCInfo(detected.advertiserName);
    if (vcInfo) {
      container.innerHTML = renderVerifiedAd(detected, vcInfo);
      // カード展開/折りたたみのイベントリスナーを設定
      setupCardListeners();
      return;
    }
  }

  if (detected.result === 'fake') {
    container.innerHTML = renderFakeAd(detected);
    return;
  }

  // unknown
  container.innerHTML = renderNoDetection();
};

/**
 * カード展開/折りたたみのイベントリスナー設定
 */
const setupCardListeners = (): void => {
  document.querySelectorAll('.card-header').forEach((header) => {
    header.addEventListener('click', () => {
      const card = header.parentElement;
      if (card) {
        card.classList.toggle('card-expanded');
      }
    });
  });
};

// 初期化
document.addEventListener('DOMContentLoaded', updateUI);
