/**
 * Content Script - VC検出（全サイト対応）
 * Phase 7: <script type="application/dc+sd-jwt"> を検出してBackgroundに通知
 *
 * news-site.ts（デモサイト専用）とは完全に分離。
 * VCがないページでは querySelectorAll 1回で即リターン（軽量）。
 */

const detectContentProofVC = (): void => {
  // 将来のvc+sd-jwt対応も考慮したセレクタ
  const vcScripts = document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/dc+sd-jwt"], script[type="application/vc+sd-jwt"]'
  );

  if (vcScripts.length === 0) return;

  console.log(`[VCDetector] Found ${vcScripts.length} VC(s) on page`);

  vcScripts.forEach((script) => {
    const vcRaw = script.textContent?.trim();
    if (!vcRaw) return;

    const type = script.getAttribute('type') ?? '';
    const format = type.includes('vc+sd-jwt') ? 'vc+sd-jwt' : 'dc+sd-jwt';

    chrome.runtime.sendMessage({
      type: 'VC_DETECTED',
      vcRaw,
      format,
      elementId: script.id || '',
      url: window.location.href,
    });
  });
};

// ページロード時に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectContentProofVC);
} else {
  detectContentProofVC();
}
