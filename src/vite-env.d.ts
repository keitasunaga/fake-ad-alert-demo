/// <reference types="vite/client" />

/**
 * Vite用の型定義
 * ?raw インポート（テキストとしてファイルをインポート）のサポート
 */

// YAMLファイルの ?raw インポート
declare module '*.yml?raw' {
  const content: string;
  export default content;
}

declare module '*.yaml?raw' {
  const content: string;
  export default content;
}
