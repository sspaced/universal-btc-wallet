# Universal Wallet - Development Guide

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
# Build PWA
npm run build:pwa

# Build Chrome Extension
npm run build:extension

# Build both
npm run build
```

### Testing & Security
```bash
# Type checking
npm run typecheck

# Security linting
npm run lint:security

# Security audit
npm run test:security
```

## 🏗️ Architecture

This wallet follows **Clean Architecture** principles:

- **Domain Layer**: Core business logic (`src/domain/`)
- **Infrastructure Layer**: External dependencies (`src/infrastructure/`)
- **Application Layer**: Use cases (`src/application/`)
- **Presentation Layer**: UI components (`src/presentation/`)

## 🔒 Security Features

- **Multi-layer encryption** (AES-256-GCM)
- **Hardware security** module integration
- **Rate limiting** and DDoS protection
- **Anti-phishing** detection
- **Biometric authentication** support
- **Security event logging**
- **Content Security Policy** headers

## 📱 Deployment Targets

- **PWA**: Progressive Web App with service worker
- **Chrome Extension**: Manifest V3 compatible
- **Mobile**: Responsive design for all devices

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

## 📂 Key Directories

- `src/domain/` - Business logic and entities
- `src/infrastructure/` - Security services and blockchain
- `src/application/` - Use cases and services
- `src/presentation/` - React components and pages
- `src/extension/` - Chrome extension files
- `src/pwa/` - PWA configuration

## 🔧 Configuration Files

- `vite.config.ts` - Build configuration
- `tailwind.config.js` - UI styling
- `tsconfig.json` - TypeScript settings
- `.eslintrc.security.js` - Security linting rules

## 🌐 Browser Support

- Chrome/Chromium 100+
- Firefox 100+
- Safari 15+
- Edge 100+

## 📋 Next Steps

1. **Test development server**: `npm run dev`
2. **Build production version**: `npm run build`
3. **Install Chrome extension**: Load unpacked from `dist/extension/`
4. **Deploy PWA**: Upload `dist/` to web server
5. **Configure security**: Update CSP headers for production

## 🔐 Security Checklist

- [ ] Update all default passwords
- [ ] Configure production API keys
- [ ] Enable rate limiting
- [ ] Set up SSL certificates
- [ ] Configure CSP headers
- [ ] Enable security monitoring
- [ ] Test backup/recovery flows
- [ ] Audit smart contract integrations

## 📞 Support

For development issues or security concerns, refer to the project documentation or create an issue in the repository.