import { injectable } from 'inversify';
import { ISecurityRepository, SecurityEvent, AuthSession } from '../../domain/repositories/ISecurityRepository';
import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError, NotFoundError } from '../../shared/errors/DomainError';

@injectable()
export class InMemorySecurityRepository implements ISecurityRepository {
  private readonly securityEvents: SecurityEvent[] = [];
  private readonly sessions = new Map<string, AuthSession>();

  async logSecurityEvent(event: SecurityEvent): Promise<Result<void, DomainError>> {
    try {
      this.securityEvents.push(event);

      // Keep only last 1000 events to prevent memory issues
      if (this.securityEvents.length > 1000) {
        this.securityEvents.splice(0, this.securityEvents.length - 1000);
      }

      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to log security event', { error }));
    }
  }

  async getSecurityEvents(limit?: number, offset?: number): Promise<Result<SecurityEvent[], DomainError>> {
    try {
      let events = [...this.securityEvents];

      // Sort by timestamp (newest first)
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Apply pagination
      if (offset) {
        events = events.slice(offset);
      }

      if (limit) {
        events = events.slice(0, limit);
      }

      return ResultUtils.success(events);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to get security events', { error }));
    }
  }

  async createSession(session: AuthSession): Promise<Result<void, DomainError>> {
    try {
      this.sessions.set(session.id, session);
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to create session', { error }));
    }
  }

  async getSession(sessionId: string): Promise<Result<AuthSession | null, DomainError>> {
    try {
      const session = this.sessions.get(sessionId) || null;
      return ResultUtils.success(session);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to get session', { error }));
    }
  }

  async updateSessionAccess(sessionId: string): Promise<Result<void, DomainError>> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return ResultUtils.failure(new NotFoundError('Session not found'));
      }

      const updatedSession: AuthSession = {
        ...session,
        lastAccessedAt: new Date()
      };

      this.sessions.set(sessionId, updatedSession);
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to update session access', { error }));
    }
  }

  async invalidateSession(sessionId: string): Promise<Result<void, DomainError>> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return ResultUtils.failure(new NotFoundError('Session not found'));
      }

      const updatedSession: AuthSession = {
        ...session,
        isActive: false
      };

      this.sessions.set(sessionId, updatedSession);
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to invalidate session', { error }));
    }
  }

  async invalidateAllSessions(userId: string): Promise<Result<void, DomainError>> {
    try {
      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.userId === userId) {
          const updatedSession: AuthSession = {
            ...session,
            isActive: false
          };
          this.sessions.set(sessionId, updatedSession);
        }
      }

      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to invalidate all sessions', { error }));
    }
  }

  async getActiveSessions(userId: string): Promise<Result<AuthSession[], DomainError>> {
    try {
      const activeSessions: AuthSession[] = [];

      for (const session of this.sessions.values()) {
        if (session.userId === userId && session.isActive && session.expiresAt > new Date()) {
          activeSessions.push(session);
        }
      }

      return ResultUtils.success(activeSessions);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to get active sessions', { error }));
    }
  }

  async cleanupExpiredSessions(): Promise<Result<number, DomainError>> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.expiresAt < now) {
          this.sessions.delete(sessionId);
          cleanedCount++;
        }
      }

      return ResultUtils.success(cleanedCount);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to cleanup expired sessions', { error }));
    }
  }
}