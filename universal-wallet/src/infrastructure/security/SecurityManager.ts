import { ISecurityService, AuthenticationResult, SecurityScore, ThreatAssessment, BiometricData } from '../../domain/services/ISecurityService';
import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError, SecurityError, ValidationError } from '../../shared/errors/DomainError';
// import * as argon2 from 'argon2'; // Removed for browser compatibility
import * as crypto from 'crypto';

export class SecurityManager implements ISecurityService {
  private readonly sessions = new Map<string, { userId: string; expiresAt: Date; lastAccess: Date }>();
  private readonly rateLimits = new Map<string, { count: number; resetTime: Date }>();
  private readonly mfaSecrets = new Map<string, string>();
  private readonly biometricData = new Map<string, BiometricData[]>();
  private readonly securityEvents: Array<{ type: string; severity: string; timestamp: Date; details: Record<string, unknown> }> = [];

  private readonly maxPasswordLength = 128;
  private readonly minPasswordLength = 8;
  private readonly sessionDuration = 15 * 60 * 1000; // 15 minutes
  private readonly rateLimitWindow = 15 * 60 * 1000; // 15 minutes
  private readonly maxAttempts = 5;

  async authenticate(credentials: { password: string; biometric?: BiometricData }): Promise<Result<AuthenticationResult, DomainError>> {
    try {
      if (!credentials.password) {
        return ResultUtils.failure(new ValidationError('Password is required'));
      }

      // Check rate limiting
      const rateLimitCheck = await this.checkRateLimit('auth', 'login');
      if (!rateLimitCheck.success || !rateLimitCheck.value) {
        await this.logSecurityEvent({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          details: { action: 'login' }
        });
        return ResultUtils.failure(new SecurityError('Rate limit exceeded'));
      }

      // Validate password strength
      const strengthCheck = await this.checkPasswordStrength(credentials.password);
      if (!strengthCheck.success) {
        return strengthCheck;
      }

      if (strengthCheck.value.score < 60) {
        return ResultUtils.failure(new SecurityError('Password does not meet security requirements'));
      }

      // For demo purposes, we'll simulate successful authentication
      // In real implementation, you'd verify against stored hash
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + this.sessionDuration);

      this.sessions.set(sessionId, {
        userId: 'demo-user',
        expiresAt,
        lastAccess: new Date()
      });

      await this.logSecurityEvent({
        type: 'successful_login',
        severity: 'low',
        details: { sessionId }
      });

      return ResultUtils.success({
        isAuthenticated: true,
        sessionId,
        expiresAt,
        requiresMfa: false
      });
    } catch (error) {
      await this.logSecurityEvent({
        type: 'authentication_error',
        severity: 'high',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return ResultUtils.failure(new SecurityError('Authentication failed', { error }));
    }
  }

  async logout(sessionId: string): Promise<Result<void, DomainError>> {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        this.sessions.delete(sessionId);
        await this.logSecurityEvent({
          type: 'logout',
          severity: 'low',
          details: { sessionId, userId: session.userId }
        });
      }
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Logout failed', { error }));
    }
  }

  async validateSession(sessionId: string): Promise<Result<boolean, DomainError>> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return ResultUtils.success(false);
      }

      if (session.expiresAt < new Date()) {
        this.sessions.delete(sessionId);
        await this.logSecurityEvent({
          type: 'session_expired',
          severity: 'low',
          details: { sessionId }
        });
        return ResultUtils.success(false);
      }

      // Update last access
      session.lastAccess = new Date();
      return ResultUtils.success(true);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Session validation failed', { error }));
    }
  }

  async generateMfaSecret(): Promise<Result<string, DomainError>> {
    try {
      // Generate base32 secret for TOTP
      const secret = crypto.randomBytes(20).toString('base64').replace(/[^A-Z2-7]/gi, '').substring(0, 32);
      return ResultUtils.success(secret);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Failed to generate MFA secret', { error }));
    }
  }

  async verifyMfaToken(secret: string, token: string): Promise<Result<boolean, DomainError>> {
    try {
      if (!secret || !token) {
        return ResultUtils.failure(new ValidationError('Secret and token are required'));
      }

      // Simplified TOTP verification (in real implementation, use proper TOTP library)
      const timeStep = Math.floor(Date.now() / 30000);
      const expectedToken = this.generateTotpToken(secret, timeStep);

      return ResultUtils.success(token === expectedToken);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('MFA verification failed', { error }));
    }
  }

  async enableMfa(userId: string, secret: string): Promise<Result<void, DomainError>> {
    try {
      this.mfaSecrets.set(userId, secret);
      await this.logSecurityEvent({
        type: 'mfa_enabled',
        severity: 'low',
        details: { userId }
      });
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Failed to enable MFA', { error }));
    }
  }

  async disableMfa(userId: string): Promise<Result<void, DomainError>> {
    try {
      this.mfaSecrets.delete(userId);
      await this.logSecurityEvent({
        type: 'mfa_disabled',
        severity: 'medium',
        details: { userId }
      });
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Failed to disable MFA', { error }));
    }
  }

  async hashPassword(password: string): Promise<Result<string, DomainError>> {
    try {
      if (!password || password.length < this.minPasswordLength || password.length > this.maxPasswordLength) {
        return ResultUtils.failure(new ValidationError('Invalid password length'));
      }

      // Use PBKDF2 for browser compatibility instead of argon2
      const salt = crypto.randomBytes(32);
      const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
      const combined = salt.toString('hex') + ':' + hash.toString('hex');

      return ResultUtils.success(combined);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Password hashing failed', { error }));
    }
  }

  async verifyPassword(password: string, hash: string): Promise<Result<boolean, DomainError>> {
    try {
      // Parse salt and hash from combined string (format: salt:hash)
      const [saltHex, hashHex] = hash.split(':');
      if (!saltHex || !hashHex) {
        return ResultUtils.success(false);
      }

      const salt = Buffer.from(saltHex, 'hex');
      const originalHash = Buffer.from(hashHex, 'hex');
      const newHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
      const isValid = crypto.timingSafeEqual(originalHash, newHash);
      return ResultUtils.success(isValid);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Password verification failed', { error }));
    }
  }

  async checkPasswordStrength(password: string): Promise<Result<SecurityScore, DomainError>> {
    try {
      let score = 0;
      const factors = {
        passwordStrength: 0,
        mfaEnabled: false,
        recentActivity: 50,
        deviceTrust: 50
      };
      const recommendations: string[] = [];

      // Length check
      if (password.length >= 12) score += 25;
      else if (password.length >= 8) score += 15;
      else recommendations.push('Use at least 12 characters');

      // Character diversity
      if (/[a-z]/.test(password)) score += 10;
      else recommendations.push('Include lowercase letters');

      if (/[A-Z]/.test(password)) score += 10;
      else recommendations.push('Include uppercase letters');

      if (/\d/.test(password)) score += 10;
      else recommendations.push('Include numbers');

      if (/[^a-zA-Z\d]/.test(password)) score += 15;
      else recommendations.push('Include special characters');

      // Pattern checks
      if (!/(.)\1{2,}/.test(password)) score += 10;
      else recommendations.push('Avoid repeating characters');

      if (!/123|abc|qwe/i.test(password)) score += 10;
      else recommendations.push('Avoid common patterns');

      // Common password check (simplified)
      const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
      if (!commonPasswords.some(common => password.toLowerCase().includes(common))) {
        score += 10;
      } else {
        recommendations.push('Avoid common passwords');
      }

      factors.passwordStrength = score;

      return ResultUtils.success({
        score,
        factors,
        recommendations
      });
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Password strength check failed', { error }));
    }
  }

  async enrollBiometric(userId: string, biometricData: BiometricData): Promise<Result<string, DomainError>> {
    try {
      if (!userId || !biometricData.template) {
        return ResultUtils.failure(new ValidationError('User ID and biometric template are required'));
      }

      if (biometricData.confidence < 0.8) {
        return ResultUtils.failure(new SecurityError('Biometric confidence too low'));
      }

      const biometricId = crypto.randomUUID();
      const userBiometrics = this.biometricData.get(userId) || [];
      userBiometrics.push({ ...biometricData, template: biometricId });
      this.biometricData.set(userId, userBiometrics);

      await this.logSecurityEvent({
        type: 'biometric_enrolled',
        severity: 'low',
        details: { userId, biometricType: biometricData.type }
      });

      return ResultUtils.success(biometricId);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Biometric enrollment failed', { error }));
    }
  }

  async verifyBiometric(userId: string, biometricData: BiometricData): Promise<Result<boolean, DomainError>> {
    try {
      const userBiometrics = this.biometricData.get(userId);
      if (!userBiometrics || userBiometrics.length === 0) {
        return ResultUtils.success(false);
      }

      // Simplified biometric matching (in real implementation, use proper biometric libraries)
      const match = userBiometrics.some(stored =>
        stored.type === biometricData.type &&
        biometricData.confidence >= 0.8
      );

      await this.logSecurityEvent({
        type: 'biometric_verification',
        severity: 'low',
        details: { userId, success: match, type: biometricData.type }
      });

      return ResultUtils.success(match);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Biometric verification failed', { error }));
    }
  }

  async deleteBiometric(userId: string, biometricId: string): Promise<Result<void, DomainError>> {
    try {
      const userBiometrics = this.biometricData.get(userId);
      if (userBiometrics) {
        const filtered = userBiometrics.filter(bio => bio.template !== biometricId);
        this.biometricData.set(userId, filtered);

        await this.logSecurityEvent({
          type: 'biometric_deleted',
          severity: 'medium',
          details: { userId, biometricId }
        });
      }
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Biometric deletion failed', { error }));
    }
  }

  async assessThreat(context: {
    ipAddress: string;
    userAgent: string;
    location?: string;
    previousAttempts: number;
  }): Promise<Result<ThreatAssessment, DomainError>> {
    try {
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const threats: string[] = [];
      const mitigations: string[] = [];
      let shouldBlock = false;

      // Check attempt frequency
      if (context.previousAttempts > 10) {
        riskLevel = 'critical';
        threats.push('Excessive login attempts');
        mitigations.push('Implement CAPTCHA');
        shouldBlock = true;
      } else if (context.previousAttempts > 5) {
        riskLevel = 'high';
        threats.push('Multiple failed attempts');
        mitigations.push('Require additional verification');
      }

      // Check for suspicious user agents
      const suspiciousPatterns = [/bot/i, /crawler/i, /scan/i];
      if (suspiciousPatterns.some(pattern => pattern.test(context.userAgent))) {
        riskLevel = 'high';
        threats.push('Suspicious user agent');
        mitigations.push('Block automated requests');
      }

      // Check IP reputation (simplified)
      const suspiciousIPs = ['127.0.0.1']; // Example blacklist
      if (suspiciousIPs.includes(context.ipAddress)) {
        riskLevel = 'critical';
        threats.push('Blacklisted IP address');
        mitigations.push('Block IP address');
        shouldBlock = true;
      }

      await this.logSecurityEvent({
        type: 'threat_assessment',
        severity: riskLevel,
        details: { context, riskLevel, threats, shouldBlock }
      });

      return ResultUtils.success({
        riskLevel,
        threats,
        mitigations,
        shouldBlock
      });
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Threat assessment failed', { error }));
    }
  }

  async detectPhishing(url: string): Promise<Result<boolean, DomainError>> {
    try {
      if (!url) {
        return ResultUtils.failure(new ValidationError('URL is required'));
      }

      // Basic phishing detection (in real implementation, use comprehensive databases)
      const phishingIndicators = [
        /bit\.ly|tinyurl|goo\.gl/i, // URL shorteners
        /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/i, // IP addresses
        /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+\.com/i, // Suspicious domain patterns
      ];

      const isPhishing = phishingIndicators.some(pattern => pattern.test(url));

      if (isPhishing) {
        await this.logSecurityEvent({
          type: 'phishing_detected',
          severity: 'high',
          details: { url }
        });
      }

      return ResultUtils.success(isPhishing);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Phishing detection failed', { error }));
    }
  }

  async validateDomain(domain: string): Promise<Result<boolean, DomainError>> {
    try {
      if (!domain) {
        return ResultUtils.failure(new ValidationError('Domain is required'));
      }

      // Whitelist of trusted domains
      const trustedDomains = [
        'blockchain.info',
        'blockstream.info',
        'mempool.space',
        'bitcoin.org'
      ];

      const isValid = trustedDomains.some(trusted => domain.includes(trusted));
      return ResultUtils.success(isValid);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Domain validation failed', { error }));
    }
  }

  async logSecurityEvent(event: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, unknown>;
  }): Promise<Result<void, DomainError>> {
    try {
      this.securityEvents.push({
        ...event,
        timestamp: new Date()
      });

      // Keep only last 1000 events to prevent memory issues
      if (this.securityEvents.length > 1000) {
        this.securityEvents.splice(0, this.securityEvents.length - 1000);
      }

      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Failed to log security event', { error }));
    }
  }

  async generateDeviceFingerprint(context: {
    userAgent: string;
    screen: { width: number; height: number; colorDepth: number };
    timezone: string;
    language: string;
  }): Promise<Result<string, DomainError>> {
    try {
      const fingerprintData = JSON.stringify({
        userAgent: context.userAgent,
        screen: context.screen,
        timezone: context.timezone,
        language: context.language,
        timestamp: Math.floor(Date.now() / (1000 * 60 * 60)) // Hour granularity
      });

      const fingerprint = crypto.createHash('sha256').update(fingerprintData).digest('hex');
      return ResultUtils.success(fingerprint);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Device fingerprint generation failed', { error }));
    }
  }

  async checkRateLimit(identifier: string, action: string): Promise<Result<boolean, DomainError>> {
    try {
      const key = `${identifier}:${action}`;
      const now = new Date();
      const limit = this.rateLimits.get(key);

      if (!limit || limit.resetTime < now) {
        // Reset or create new limit
        this.rateLimits.set(key, {
          count: 1,
          resetTime: new Date(now.getTime() + this.rateLimitWindow)
        });
        return ResultUtils.success(true);
      }

      if (limit.count >= this.maxAttempts) {
        return ResultUtils.success(false);
      }

      limit.count++;
      return ResultUtils.success(true);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Rate limit check failed', { error }));
    }
  }

  async recordRateLimitAttempt(identifier: string, action: string): Promise<Result<void, DomainError>> {
    const result = await this.checkRateLimit(identifier, action);
    return result.success ? ResultUtils.success(undefined) : result;
  }

  async generateNonce(): Promise<Result<string, DomainError>> {
    try {
      const nonce = crypto.randomBytes(16).toString('base64');
      return ResultUtils.success(nonce);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Nonce generation failed', { error }));
    }
  }

  async validateNonce(nonce: string): Promise<Result<boolean, DomainError>> {
    try {
      // Simplified nonce validation (in real implementation, track used nonces)
      const isValid = nonce && nonce.length > 10;
      return ResultUtils.success(isValid);
    } catch (error) {
      return ResultUtils.failure(new SecurityError('Nonce validation failed', { error }));
    }
  }

  private generateTotpToken(secret: string, timeStep: number): string {
    // Simplified TOTP generation (use proper library in production)
    const hash = crypto.createHmac('sha1', secret).update(timeStep.toString()).digest();
    const offset = hash[hash.length - 1] & 0xf;
    const code = ((hash[offset] & 0x7f) << 24) |
                 ((hash[offset + 1] & 0xff) << 16) |
                 ((hash[offset + 2] & 0xff) << 8) |
                 (hash[offset + 3] & 0xff);
    return (code % 1000000).toString().padStart(6, '0');
  }
}