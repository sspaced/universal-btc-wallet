import { Container } from 'inversify';
import 'reflect-metadata';

// Domain Services
import { ICryptoService } from '../../domain/services/ICryptoService';
import { ISecurityService } from '../../domain/services/ISecurityService';
import { IValidationService } from '../../domain/services/IValidationService';

// Infrastructure Services
import { EncryptionService } from '../../infrastructure/security/EncryptionService';
import { SecurityManager } from '../../infrastructure/security/SecurityManager';
import { ValidationService } from '../../infrastructure/security/ValidationService';
import { SimplicityService } from '../../infrastructure/blockchain/SimplicityService';

// Repositories
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { ISecurityRepository } from '../../domain/repositories/ISecurityRepository';

// Repository Implementations
import { InMemoryWalletRepository } from '../../infrastructure/repositories/InMemoryWalletRepository';
import { InMemoryTransactionRepository } from '../../infrastructure/repositories/InMemoryTransactionRepository';
import { InMemoryAccountRepository } from '../../infrastructure/repositories/InMemoryAccountRepository';
import { InMemorySecurityRepository } from '../../infrastructure/repositories/InMemorySecurityRepository';

// Application Services
import { WalletService } from '../../application/services/WalletService';

// Symbol identifiers for dependency injection
export const TYPES = {
  // Domain Services
  ICryptoService: Symbol.for('ICryptoService'),
  ISecurityService: Symbol.for('ISecurityService'),
  IValidationService: Symbol.for('IValidationService'),

  // Repositories
  IWalletRepository: Symbol.for('IWalletRepository'),
  ITransactionRepository: Symbol.for('ITransactionRepository'),
  IAccountRepository: Symbol.for('IAccountRepository'),
  ISecurityRepository: Symbol.for('ISecurityRepository'),

  // Application Services
  WalletService: Symbol.for('WalletService'),

  // Blockchain Services
  SimplicityService: Symbol.for('SimplicityService'),
};

// Create IoC container
const container = new Container({
  defaultScope: 'Singleton'
});

// Bind services
container.bind<ICryptoService>(TYPES.ICryptoService).to(EncryptionService);
container.bind<ISecurityService>(TYPES.ISecurityService).to(SecurityManager);
container.bind<IValidationService>(TYPES.IValidationService).to(ValidationService);

// Bind repositories
container.bind<IWalletRepository>(TYPES.IWalletRepository).to(InMemoryWalletRepository);
container.bind<ITransactionRepository>(TYPES.ITransactionRepository).to(InMemoryTransactionRepository);
container.bind<IAccountRepository>(TYPES.IAccountRepository).to(InMemoryAccountRepository);
container.bind<ISecurityRepository>(TYPES.ISecurityRepository).to(InMemorySecurityRepository);

// Bind application services
container.bind<WalletService>(TYPES.WalletService).to(WalletService);

// Bind blockchain services
container.bind<SimplicityService>(TYPES.SimplicityService).to(SimplicityService);

export { container };