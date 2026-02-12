/**
 * VC型定義 - FakeAdAlertDemo
 * Phase 3: share-verifierと構造統一
 */

/**
 * 広告主情報
 */
export interface AdvertiserInfo {
  name: string;
  advertiserDid: string;
  category: string;
  platform: string;
}

/**
 * 検証ステータス（5項目）
 */
export interface VerificationStatus {
  issuerSignature: boolean;
  expiration: boolean;
  revocationStatus: boolean;
  trustRegistry: boolean;
  blockchain: boolean;
}

/**
 * 信頼チェーンのエンティティ
 */
export interface TrustChainEntity {
  name: string;
  role: string;
  did?: string;
}

/**
 * 信頼チェーン（3階層）
 */
export interface TrustChain {
  root: TrustChainEntity;
  intermediate: TrustChainEntity;
  subject: TrustChainEntity;
}

/**
 * ブロックチェーン証明
 */
export interface BlockchainProof {
  network: string;
  transactionHash: string;
  contractAddress: string;
}

/**
 * VC情報（メイン構造体）
 */
export interface VCInfo {
  advertiserInfo: AdvertiserInfo;
  verificationStatus: VerificationStatus;
  trustChain: TrustChain;
  blockchainProof: BlockchainProof;
  vcId: string;
  issuedAt: string;
  expiresAt: string;
}

/**
 * 検出結果（storageに保存する情報）
 * Phase 4以前の後方互換用（Instagram/TikTok Content Scriptが送信）
 */
export interface DetectedAdInfo {
  advertiserName: string;
  platform: 'instagram' | 'tiktok' | 'news-site';
  result: 'verified' | 'fake' | 'unknown';
  matchedPattern?: string;
  listType?: string;
  detectedAt: string;
}

/**
 * 検出アイテム（Phase 6: マルチVC対応）
 * サイトVCと広告VCを統一的に扱う
 */
export interface DetectedItem {
  /** 一意のID */
  id: string;
  /** アイテムの種類 */
  type: 'site' | 'ad';
  /** 広告主名 or サイト名 */
  advertiserName: string;
  /** プラットフォーム */
  platform: 'instagram' | 'tiktok' | 'news-site';
  /** 判定結果 */
  result: 'verified' | 'fake' | 'unknown';
  /** マッチしたパターン */
  matchedPattern?: string;
  /** リストタイプ */
  listType?: string;
  /** 検出日時 */
  detectedAt: string;
}
