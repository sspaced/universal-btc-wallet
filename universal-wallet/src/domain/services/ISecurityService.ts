import { Result } from '../../shared/types/Result';
import { DomainError } from '../../shared/errors/DomainError';

export interface AuthenticationResult {
  isAuthenticated: boolean;
  sessionId?: string;
  expiresAt?: Date;
  requiresMfa?: boolean;
}

export interface SecurityScore {
  score: number; // 0-100
  factors: {
    passwordStrength: number;
    mfaEnabled: boolean;
    recentActivity: number;
    deviceTrust: number;
  };
  recommendations: string[];
}

export interface ThreatAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  mitigations: string[];
  shouldBlock: boolean;
}

export interface BiometricData {
  type: 'fingerprint' | 'face' | 'voice';
  template: string;
  confidence: number;
}

export interface ISecurityService {
  // Authentication
  authenticate(credentials: { password: string; biometric?: BiometricData }): Promise<Result<AuthenticationResult, DomainError>>;
  logout(sessionId: string): Promise<Result<void, DomainError>>;
  validateSession(sessionId: string): Promise<Result<boolean, DomainError>>;

  // Multi-factor authentication
  generateMfaSecret(): Promise<Result<string, DomainError>>;
  verifyMfaToken(secret: string, token: string): Promise<Result<boolean, DomainError>>;
  enableMfa(userId: string, secret: string): Promise<Result<void, DomainError>>;
  disableMfa(userId: string): Promise<Result<void, DomainError>>;

  // Password security
  hashPassword(password: string): Promise<Result<string, DomainError>>;
  verifyPassword(password: string, hash: string): Promise<Result<boolean, DomainError>>;
  checkPasswordStrength(password: string): Promise<Result<SecurityScore, DomainError>>;

  // Biometric authentication
  enrollBiometric(userId: string, biometricData: BiometricData): Promise<Result<string, DomainError>>;
  verifyBiometric(userId: string, biometricData: BiometricData): Promise<Result<boolean, DomainError>>;
  deleteBiometric(userId: string, biometricId: string): Promise<Result<void, DomainError>>;

  // Threat detection
  assessThreat(context: {
    ipAddress: string;
    userAgent: string;
    location?: string;
    previousAttempts: number;
  }): Promise<Result<ThreatAssessment, DomainError>>;

  // Anti-phishing
  detectPhishing(url: string): Promise<Result<boolean, DomainError>>;
  validateDomain(domain: string): Promise<Result<boolean, DomainError>>;

  // Security monitoring
  logSecurityEvent(event: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, unknown>;
  }): Promise<Result<void, DomainError>>;

  // Device fingerprinting
  generateDeviceFingerprint(context: {
    userAgent: string;
    screen: { width: number; height: number; colorDepth: number };
    timezone: string;
    language: string;
  }): Promise<Result<string, DomainError>>;

  // Rate limiting
  checkRateLimit(identifier: string, action: string): Promise<Result<boolean, DomainError>>;
  recordRateLimitAttempt(identifier: string, action: string): Promise<Result<void, DomainError>>;

  // Content Security Policy
  generateNonce(): Promise<Result<string, DomainError>>;
  validateNonce(nonce: string): Promise<Result<boolean, DomainError>>;
}