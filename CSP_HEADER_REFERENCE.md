# Content-Security-Policy Header Reference

## Complete CSP Header

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://soroban-testnet.stellar.org https://soroban-mainnet.stellar.org https://horizon-testnet.stellar.org https://horizon.stellar.org; img-src 'self' data:; font-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'
```

## Directive Breakdown

### Foundational Directives
- `default-src 'self'` — Failsafe: blocks anything not explicitly allowed

### Script & Content Security
- `script-src 'self'` — Only same-origin scripts; no inline code or eval
- `style-src 'self' 'unsafe-inline'` — Tailwind CSS inlining (upgrade path: hash-based)

### Network Restrictions
- `connect-src 'self' https://soroban-testnet.stellar.org https://soroban-mainnet.stellar.org https://horizon-testnet.stellar.org https://horizon.stellar.org` — Only Stellar RPC endpoints

### Resource Loading
- `img-src 'self' data:` — Same-origin images + inlined SVG
- `font-src 'self'` — Same-origin fonts only
- `media-src 'self'` — Same-origin audio/video

### Attack Prevention
- `object-src 'none'` — Disables plugins/Flash
- `base-uri 'self'` — Prevents base tag injection
- `frame-ancestors 'none'` — Clickjacking protection
- `form-action 'self'` — CSRF protection

## Supporting Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), ambient-light-sensor=(), battery=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
```

## Deployment

### Netlify / Netlify-Compatible CDNs
File location: `/public/_headers`
- Automatically picked up by Netlify, Cloudflare Pages, etc.
- Applies to all routes matching `/*`
- No additional configuration required

### Local Development
- Vite dev server applies CSP from `vite.config.ts`
- Matches production headers exactly

### Verification
```bash
# Build for production
npm run build

# Check headers in DevTools
# Network tab → any request → Response Headers → Content-Security-Policy

# Validate with Google CSP Evaluator
# https://csp-evaluator.withgoogle.com/
```

## Testing

```bash
# Run CSP validation tests
npm test -- tests/csp-header.test.ts

# Expected output:
# ✓ tests/csp-header.test.ts (21 tests) 7ms
# Test Files  1 passed (1)
# Tests  21 passed (21)
```

## Future Upgrades

### v2.0: Hash-Based Styles
Replace `style-src 'unsafe-inline'` with:
```
style-src 'sha256-<tailwind-hash>'
```
This improves CSP score from 9/10 to 10/10.

### v3.0: CSP Violation Reporting
Add monitoring via:
```
report-uri https://smile4money.app/csp-report
report-to csp-endpoint
```

## Security Benefits

- ✅ XSS Protection: Inline scripts blocked
- ✅ Private Key Protection: Credential exfiltration prevented
- ✅ Transaction Security: Fund redirection blocked
- ✅ Clickjacking: iframe embedding denied
- ✅ CSRF: Cross-origin forms blocked
- ✅ Plugin Attacks: Flash/ActiveX disabled

## References

- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Mozilla CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Stellar Security Best Practices](https://soroban.stellar.org/docs/security)
