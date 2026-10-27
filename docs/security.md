# PhishGuard AI — Security Architecture & SSRF Hardening

## 1. Zero Untrusted Web Fetching
A critical cybersecurity pitfall in URL scanners is blindly fetching submitted links from the backend server. PhishGuard AI explicitly does **not** make outbound HTTP requests to user-submitted targets. All analysis is performed through:
- Lexical & mathematical parsing of the URL string
- Domain structural extraction
- Offline/mocked threat intelligence interfaces

## 2. Server-Side Request Forgery (SSRF) Prevention
Before any internal inspection, `URLService` enforces strict checks against private and reserved address blocks:
- Loopback addresses (`127.0.0.0/8`, `::1`)
- RFC1918 Private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
- Cloud Instance Metadata (`169.254.169.254` / link-local `169.254.0.0/16`)
- Hostnames matching `localhost`, `*.localhost`, `*.local`

## 3. Disallowed Protocols
Analysis is restricted strictly to `http` and `https`. Dangerous protocols (`javascript:`, `file:`, `data:`, `ftp:`, `ldap:`) are rejected immediately with `FORBIDDEN_PROTOCOL` error codes.

## 4. XSS & Display Safety
URLs submitted by users or stored in the database are treated as untrusted text. They are never rendered as executable HTML or script tags in the frontend and are safely styled with standard text wrapping and CSS truncation.

## 5. Authentication & Passwords
- Passwords hashed with `bcrypt` (12 rounds) with salted keys.
- JWT tokens signed with `HS256` containing non-sensitive payload identifiers.
- Role-based authorization (`USER` vs `ADMIN`) enforced via dependency injection on the server.
