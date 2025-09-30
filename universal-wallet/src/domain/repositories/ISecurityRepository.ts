import { Result } from '../../shared/types/Result';
import { DomainError } from '../../shared/errors/DomainError';

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'transaction' | 'access_attempt' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastAccessedAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface ISecurityRepository {
  logSecurityEvent(event: SecurityEvent): Promise<Result<void, DomainError>>;
  getSecurityEvents(limit?: number, offset?: number): Promise<Result<SecurityEvent[], DomainError>>;
  createSession(session: AuthSession): Promise<Result<void, DomainError>>;
  getSession(sessionId: string): Promise<Result<AuthSession | null, DomainError>>;
  updateSessionAccess(sessionId: string): Promise<Result<void, DomainError>>;
  invalidateSession(sessionId: string): Promise<Result<void, DomainError>>;
  invalidateAllSessions(userId: string): Promise<Result<void, DomainError>>;
  getActiveSessions(userId: string): Promise<Result<AuthSession[], DomainError>>;
  cleanupExpiredSessions(): Promise<Result<number, DomainError>>;
}