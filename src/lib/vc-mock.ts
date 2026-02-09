/**
 * モックVC情報 - FakeAdAlertDemo
 * Phase 3: ホワイトリスト企業のVC情報
 * share-verifierのdata/patterns.jsonと同等のデータ構造
 */

import type { VCInfo, TrustChain, BlockchainProof } from './vc-types';

/**
 * 共通の信頼チェーン生成（消費者庁 → トラスト広告社 → 広告主）
 */
const createTrustChain = (subjectName: string, subjectDid: string): TrustChain => ({
  root: {
    name: '消費者庁',
    role: '信頼の基点',
    did: 'did:web:caa.go.jp',
  },
  intermediate: {
    name: 'トラスト広告社',
    role: '認定広告審査機関',
    did: 'did:web:trust-ad.co.jp',
  },
  subject: {
    name: subjectName,
    role: '広告主',
    did: subjectDid,
  },
});

/**
 * 共通のブロックチェーン証明生成
 */
const createBlockchainProof = (txHash: string): BlockchainProof => ({
  network: 'Sepolia',
  transactionHash: txHash,
  contractAddress: '0xa67515e219ee1072e65A14b5A3439951b4b6d3D1',
});

/**
 * 全検証項目を合格にする共通ステータス
 */
const allVerified = () => ({
  issuerSignature: true,
  expiration: true,
  revocationStatus: true,
  trustRegistry: true,
  blockchain: true,
});

/**
 * 企業別モックVC情報マッピング
 */
const vcDatabase: Record<string, VCInfo> = {
  // トヨタ自動車
  toyota: {
    advertiserInfo: {
      name: 'トヨタ自動車株式会社',
      advertiserDid: 'did:web:toyota.co.jp',
      category: '自動車広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain('トヨタ自動車', 'did:web:toyota.co.jp'),
    blockchainProof: createBlockchainProof('0x8f2e4a1b9c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d3a1b'),
    vcId: 'urn:uuid:toyota-ad-001',
    issuedAt: '2025-01-15T00:00:00Z',
    expiresAt: '2026-01-15T00:00:00Z',
  },

  // ソニー
  sony: {
    advertiserInfo: {
      name: 'ソニーグループ株式会社',
      advertiserDid: 'did:web:sony.co.jp',
      category: '電子機器・エンタメ広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain('ソニーグループ', 'did:web:sony.co.jp'),
    blockchainProof: createBlockchainProof('0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab'),
    vcId: 'urn:uuid:sony-ad-001',
    issuedAt: '2025-02-01T00:00:00Z',
    expiresAt: '2026-02-01T00:00:00Z',
  },

  // ユニクロ
  uniqlo: {
    advertiserInfo: {
      name: '株式会社ファーストリテイリング',
      advertiserDid: 'did:web:uniqlo.co.jp',
      category: 'ファッション広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain('ユニクロ', 'did:web:uniqlo.co.jp'),
    blockchainProof: createBlockchainProof('0xf1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e'),
    vcId: 'urn:uuid:uniqlo-ad-001',
    issuedAt: '2025-03-01T00:00:00Z',
    expiresAt: '2026-03-01T00:00:00Z',
  },

  // 楽天
  rakuten: {
    advertiserInfo: {
      name: '楽天グループ株式会社',
      advertiserDid: 'did:web:rakuten.co.jp',
      category: 'EC・フィンテック広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain('楽天グループ', 'did:web:rakuten.co.jp'),
    blockchainProof: createBlockchainProof('0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'),
    vcId: 'urn:uuid:rakuten-ad-001',
    issuedAt: '2025-01-20T00:00:00Z',
    expiresAt: '2026-01-20T00:00:00Z',
  },

  // Apple
  apple: {
    advertiserInfo: {
      name: 'Apple Inc.',
      advertiserDid: 'did:web:apple.com',
      category: 'テクノロジー広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain('Apple', 'did:web:apple.com'),
    blockchainProof: createBlockchainProof('0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678ab'),
    vcId: 'urn:uuid:apple-ad-001',
    issuedAt: '2025-04-01T00:00:00Z',
    expiresAt: '2026-04-01T00:00:00Z',
  },

  // Nike
  nike: {
    advertiserInfo: {
      name: 'Nike, Inc.',
      advertiserDid: 'did:web:nike.com',
      category: 'スポーツ・アパレル広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain('Nike', 'did:web:nike.com'),
    blockchainProof: createBlockchainProof('0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'),
    vcId: 'urn:uuid:nike-ad-001',
    issuedAt: '2025-02-15T00:00:00Z',
    expiresAt: '2026-02-15T00:00:00Z',
  },

  // ソフトバンク
  softbank: {
    advertiserInfo: {
      name: 'ソフトバンクグループ株式会社',
      advertiserDid: 'did:web:softbank.jp',
      category: '通信・テクノロジー広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain('ソフトバンク', 'did:web:softbank.jp'),
    blockchainProof: createBlockchainProof('0x5b4a3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b'),
    vcId: 'urn:uuid:softbank-ad-001',
    issuedAt: '2025-03-15T00:00:00Z',
    expiresAt: '2026-03-15T00:00:00Z',
  },

  // Adidas
  adidas: {
    advertiserInfo: {
      name: 'adidas AG',
      advertiserDid: 'did:web:adidas.com',
      category: 'スポーツ・アパレル広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain('adidas', 'did:web:adidas.com'),
    blockchainProof: createBlockchainProof('0x3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f'),
    vcId: 'urn:uuid:adidas-ad-001',
    issuedAt: '2025-04-10T00:00:00Z',
    expiresAt: '2026-04-10T00:00:00Z',
  },

  // Coca-Cola
  cocacola: {
    advertiserInfo: {
      name: 'The Coca-Cola Company',
      advertiserDid: 'did:web:coca-cola.com',
      category: '飲料広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain('Coca-Cola', 'did:web:coca-cola.com'),
    blockchainProof: createBlockchainProof('0x7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d'),
    vcId: 'urn:uuid:cocacola-ad-001',
    issuedAt: '2025-05-01T00:00:00Z',
    expiresAt: '2026-05-01T00:00:00Z',
  },

  // McDonald's
  mcdonalds: {
    advertiserInfo: {
      name: "McDonald's Corporation",
      advertiserDid: 'did:web:mcdonalds.com',
      category: '飲食広告',
      platform: '',
    },
    verificationStatus: allVerified(),
    trustChain: createTrustChain("McDonald's", 'did:web:mcdonalds.com'),
    blockchainProof: createBlockchainProof('0x0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e'),
    vcId: 'urn:uuid:mcdonalds-ad-001',
    issuedAt: '2025-05-15T00:00:00Z',
    expiresAt: '2026-05-15T00:00:00Z',
  },
};

/**
 * 広告主名からモックVC情報を取得
 */
export const getVCInfo = (advertiserName: string): VCInfo | null => {
  const lowerName = advertiserName.toLowerCase();
  for (const [key, vcInfo] of Object.entries(vcDatabase)) {
    if (lowerName.includes(key)) {
      return { ...vcInfo };
    }
  }
  return null;
};
