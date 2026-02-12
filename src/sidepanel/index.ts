/**
 * Side Panel Script - FakeAdAlertDemo
 * Phase 6: マルチVCギャラリー（ストーリーバー型）
 */

import type { DetectedItem, VCInfo } from '../lib/vc-types';
import { getVCInfo, getSiteVCInfo } from '../lib/vc-mock';

const STORAGE_KEY = 'detectedItems';

/** 現在選択中のアイテムID */
let selectedItemId: string | null = null;

// ── ユーティリティ ──

/**
 * 広告主名から頭文字を取得（日本語1文字、英語2文字）
 */
const getInitial = (name: string): string => {
  const first = name.charAt(0);
  // ASCII文字（英字）の場合は2文字
  if (/[A-Za-z]/.test(first)) {
    return name.substring(0, 2).toUpperCase();
  }
  // 日本語等は1文字
  return first;
};

/**
 * ラベル用の省略名（最大6文字）
 */
const getLabel = (name: string): string => {
  return name.length > 6 ? name.substring(0, 6) : name;
};

/**
 * プラットフォーム名の日本語表示
 */
const platformLabel = (platform: string): string => {
  switch (platform) {
    case 'instagram': return 'Instagram';
    case 'tiktok': return 'TikTok';
    case 'news-site': return 'ニュースサイト';
    default: return platform;
  }
};

// ── 展開可能カード（既存ロジック流用） ──

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

// ── VCカード共通レンダリング ──

/**
 * 4枚のVCカードを生成（広告情報、検証ステータス、信頼チェーン、ブロックチェーン）
 */
const renderVCCards = (item: DetectedItem, vcInfo: VCInfo): string => {
  const infoTitle = item.type === 'site' ? 'サイト情報' : '広告情報';
  const infoCard = createExpandableCard('&#x1F4CB;', infoTitle, `
    ${createInfoRow(item.type === 'site' ? '発行者' : '広告主', vcInfo.advertiserInfo.name)}
    ${createInfoRow(item.type === 'site' ? '発行者DID' : '広告主DID', vcInfo.advertiserInfo.advertiserDid, { isCode: true })}
    ${createInfoRow('カテゴリ', vcInfo.advertiserInfo.category)}
    ${createInfoRow('プラットフォーム', platformLabel(item.platform))}
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

  return infoCard + statusCard + trustChainCard + blockchainCard;
};

// ── 詳細エリアレンダリング ──

/**
 * サイトVC用の詳細表示
 */
const renderSiteVC = (item: DetectedItem, vcInfo: VCInfo): string => {
  return `
    <div class="result-header result-site">
      <span class="result-icon">&#x1F3E2;</span>
      <span class="result-text">サイト認証済み - このメディアは検証済みです</span>
    </div>
    ${renderVCCards(item, vcInfo)}
  `;
};

/**
 * 認証済み広告のUI生成
 */
const renderVerifiedAd = (item: DetectedItem, vcInfo: VCInfo): string => {
  return `
    <div class="result-header result-success">
      <span class="result-icon">&#x2705;</span>
      <span class="result-text">検証完了 - 証明書は有効です</span>
    </div>
    ${renderVCCards(item, vcInfo)}
  `;
};

/**
 * フェイク広告のUI生成
 */
const renderFakeAd = (item: DetectedItem): string => {
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
        <span class="fake-detail-value">${item.advertiserName}</span>
      </div>
      <div class="fake-detail-row">
        <span class="fake-detail-label">プラットフォーム</span>
        <span class="fake-detail-value">${platformLabel(item.platform)}</span>
      </div>
      ${item.matchedPattern ? `
      <div class="fake-detail-row">
        <span class="fake-detail-label">マッチパターン</span>
        <span class="fake-detail-value">${item.listType === 'blacklist' ? 'ブラックリスト' : item.matchedPattern}</span>
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

// ── ストーリーバーレンダリング ──

/**
 * ストーリーアイコン1つのHTML生成
 */
const renderStoryIcon = (item: DetectedItem): string => {
  const ringClass = item.type === 'site'
    ? 'ring-site'
    : item.result === 'verified'
      ? 'ring-verified'
      : 'ring-fake';

  const isSelected = item.id === selectedItemId;
  const selectedClass = isSelected ? 'story-icon--selected' : '';

  return `
    <div class="story-icon ${ringClass} ${selectedClass}" data-item-id="${item.id}">
      <div class="story-icon__circle">
        <span class="story-icon__initial">${getInitial(item.advertiserName)}</span>
      </div>
      <span class="story-icon__label">${getLabel(item.advertiserName)}</span>
    </div>
  `;
};

/**
 * ストーリーバー全体のレンダリング
 */
const renderStoryBar = (items: DetectedItem[]): void => {
  const container = document.getElementById('story-bar');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="story-bar">
      ${items.map((item) => renderStoryIcon(item)).join('')}
    </div>
  `;

  // クリックイベント設定
  container.querySelectorAll('.story-icon').forEach((icon) => {
    icon.addEventListener('click', () => {
      const id = (icon as HTMLElement).dataset.itemId;
      if (id) selectItem(id, items);
    });
  });
};

// ── 詳細エリア表示 ──

/**
 * 選択中アイテムの詳細をレンダリング
 */
const renderDetail = (item: DetectedItem): void => {
  const container = document.getElementById('vc-detail');
  if (!container) return;

  if (item.type === 'site') {
    const vcInfo = getSiteVCInfo(item.advertiserName);
    if (vcInfo) {
      container.innerHTML = renderSiteVC(item, vcInfo);
      setupCardListeners();
      return;
    }
  }

  if (item.result === 'verified') {
    const vcInfo = getVCInfo(item.advertiserName);
    if (vcInfo) {
      container.innerHTML = renderVerifiedAd(item, vcInfo);
      setupCardListeners();
      return;
    }
  }

  if (item.result === 'fake' || item.result === 'unknown') {
    container.innerHTML = renderFakeAd(item);
    return;
  }

  container.innerHTML = renderNoDetection();
};

/**
 * アイテム選択
 */
const selectItem = (itemId: string, items: DetectedItem[]): void => {
  selectedItemId = itemId;
  renderStoryBar(items);
  const item = items.find((i) => i.id === itemId);
  if (item) renderDetail(item);
};

// ── カード展開/折りたたみ ──

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

// ── メインUI更新 ──

const updateUI = async (): Promise<void> => {
  const result = await chrome.storage.session.get(STORAGE_KEY);
  const items = (result[STORAGE_KEY] as DetectedItem[]) ?? [];

  const detailContainer = document.getElementById('vc-detail');

  if (items.length === 0) {
    // 未検出: ストーリーバーを空に、案内メッセージ表示
    const storyContainer = document.getElementById('story-bar');
    if (storyContainer) storyContainer.innerHTML = '';
    if (detailContainer) detailContainer.innerHTML = renderNoDetection();
    selectedItemId = null;
    return;
  }

  // 選択中のアイテムが配列に存在するか確認
  if (!selectedItemId || !items.find((i) => i.id === selectedItemId)) {
    // 先頭アイテムを自動選択
    selectedItemId = items[0].id;
  }

  renderStoryBar(items);

  const selectedItem = items.find((i) => i.id === selectedItemId);
  if (selectedItem) {
    renderDetail(selectedItem);
  }
};

// ── イベントリスナー ──

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'session' && changes[STORAGE_KEY]) {
    console.log('[FakeAdAlertDemo] Storage changed, updating side panel...');
    updateUI();
  }
});

// 初期化
document.addEventListener('DOMContentLoaded', updateUI);
