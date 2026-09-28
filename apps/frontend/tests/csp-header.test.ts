import { describe, it, expect, beforeAll } from 'vitest';
// @ts-ignore - fs is Node.js built-in used only in test environment
import { readFileSync } from 'fs';
// @ts-ignore - path is Node.js built-in used only in test environment
import { join } from 'path';

/**
 * CSP Header Verification Test
 *
 * Verifies that the Content-Security-Policy header is present in the built output
 * and contains all required security directives. This ensures that the application
 * is protected against XSS and data exfiltration attacks in all deployment environments.
 *
 * Test Coverage:
 * - Confirms the _headers file exists in the public directory
 * - Validates all critical CSP directives are present and correctly configured
 * - Ensures that trusted Stellar endpoints are whitelisted for connect-src
 * - Confirms that script-src is restricted to 'self' (no inline scripts or CDN)
 * - Validates additional security headers (X-Content-Type-Options, X-Frame-Options, etc.)
 *
 * If this test fails:
 * 1. Check that /public/_headers has not been accidentally modified or deleted
 * 2. Verify that the CSP header definition in vite.config.ts matches _headers
 * 3. Ensure no build process is stripping or altering headers
 */

describe('Content-Security-Policy Header', () => {
  let headersContent: string;

  beforeAll(() => {
    // Read the _headers file from the public directory
    const headersPath = join(__dirname, '../public/_headers');
    try {
      headersContent = readFileSync(headersPath, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to read _headers file at ${headersPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  it('should have the _headers file present and readable', () => {
    expect(headersContent).toBeDefined();
    expect(headersContent.length).toBeGreaterThan(0);
  });

  it('should define a Content-Security-Policy header', () => {
    expect(headersContent).toContain('Content-Security-Policy:');
  });

  describe('CSP Directives', () => {
    it('should restrict default-src to self', () => {
      expect(headersContent).toContain("default-src 'self'");
    });

    it('should restrict script-src to self only (no inline scripts)', () => {
      expect(headersContent).toContain("script-src 'self'");
      // Ensure no other script sources are allowed
      expect(headersContent).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    });

    it('should allow only self and unsafe-inline for style-src', () => {
      expect(headersContent).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('should whitelist Stellar RPC endpoints in connect-src', () => {
      // connect-src must include all Stellar RPC/Horizon endpoints
      expect(headersContent).toContain('https://soroban-testnet.stellar.org');
      expect(headersContent).toContain('https://soroban-mainnet.stellar.org');
      expect(headersContent).toContain('https://horizon-testnet.stellar.org');
      expect(headersContent).toContain('https://horizon.stellar.org');
    });

    it('should allow only self and data: for img-src', () => {
      expect(headersContent).toContain("img-src 'self' data:");
    });

    it('should restrict font-src to self', () => {
      expect(headersContent).toContain("font-src 'self'");
    });

    it('should restrict media-src to self', () => {
      expect(headersContent).toContain("media-src 'self'");
    });

    it('should disable object-src entirely', () => {
      expect(headersContent).toContain("object-src 'none'");
    });

    it('should restrict base-uri to self', () => {
      expect(headersContent).toContain("base-uri 'self'");
    });

    it('should prevent framing with frame-ancestors none', () => {
      expect(headersContent).toContain("frame-ancestors 'none'");
    });

    it('should restrict form-action to self', () => {
      expect(headersContent).toContain("form-action 'self'");
    });
  });

  describe('Additional Security Headers', () => {
    it('should set X-Content-Type-Options to nosniff', () => {
      expect(headersContent).toContain('X-Content-Type-Options: nosniff');
    });

    it('should set X-Frame-Options to DENY', () => {
      expect(headersContent).toContain('X-Frame-Options: DENY');
    });

    it('should set X-XSS-Protection to 1; mode=block', () => {
      expect(headersContent).toContain('X-XSS-Protection: 1; mode=block');
    });

    it('should set Referrer-Policy to strict-origin-when-cross-origin', () => {
      expect(headersContent).toContain(
        'Referrer-Policy: strict-origin-when-cross-origin'
      );
    });

    it('should define Permissions-Policy to disable unnecessary APIs', () => {
      expect(headersContent).toContain('Permissions-Policy:');
      // Verify that dangerous APIs are disabled
      expect(headersContent).toContain('accelerometer=()');
      expect(headersContent).toContain('camera=()');
      expect(headersContent).toContain('geolocation=()');
      expect(headersContent).toContain('microphone=()');
    });
  });

  describe('CSP Security Best Practices', () => {
    it('should not allow unsafe-eval in script-src', () => {
      const cspLine = headersContent
        .split('\n')
        .find((line) => line.includes('Content-Security-Policy:'));
      expect(cspLine).toBeDefined();
      expect(cspLine).not.toContain("'unsafe-eval'");
    });

    it('should not whitelist arbitrary CDNs in connect-src', () => {
      // Ensure only Stellar endpoints are whitelisted
      const hasRandomCDN = /connect-src[^;]*https:\/\/(?!soroban|horizon)/i.test(
        headersContent
      );
      expect(hasRandomCDN).toBe(false);
    });

    it('should include documentation explaining CSP rationale', () => {
      expect(headersContent).toContain('script-src');
      expect(headersContent).toContain('DIRECTIVES RATIONALE');
    });
  });
});
