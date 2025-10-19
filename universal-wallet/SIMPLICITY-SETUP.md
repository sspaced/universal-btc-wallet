# Simplicity Backend Setup Guide

## Overview
The Universal Wallet integrates with the Simplicity BRC-20 indexer to provide comprehensive BRC-20 token support. This guide will help you set up the Simplicity backend service.

## Prerequisites
- Python 3.11+
- PostgreSQL
- Redis
- Bitcoin Core node (optional for full functionality)

## Installation Methods

### Method 1: Docker Compose (Recommended)

1. **Navigate to Simplicity directory:**
   ```bash
   cd /Users/sacha/UNIVERSAL/simplicity-backend
   ```

2. **Install Docker Desktop** (if not already installed):
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

5. **Check API health:**
   ```bash
   curl http://localhost:8080/v1/indexer/brc20/health
   ```

### Method 2: Manual Installation

1. **Install Python 3.11+:**
   ```bash
   # macOS (using Homebrew)
   brew install python@3.11

   # Or download from: https://www.python.org/downloads/
   ```

2. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Create database
   createdb brc20_indexer
   ```

3. **Install Redis:**
   ```bash
   # macOS
   brew install redis
   brew services start redis
   ```

4. **Install Python dependencies:**
   ```bash
   cd /Users/sacha/UNIVERSAL/simplicity-backend
   pip install pipenv
   pipenv install --dev
   ```

5. **Run database migrations:**
   ```bash
   pipenv run alembic upgrade head
   ```

6. **Start the indexer:**
   ```bash
   pipenv run python run.py --continuous
   ```

## Configuration

The Simplicity service is pre-configured for Universal Wallet integration:

- **API Endpoint:** `http://localhost:8080`
- **CORS Origins:** Includes `http://localhost:4000` (Universal Wallet)
- **Database:** PostgreSQL on port 5432
- **Redis:** Redis on port 6379

## Universal Wallet Integration

The Universal Wallet automatically detects and connects to the Simplicity service:

1. **BRC-20 Tokens Page:** Navigate to `/brc20` in the wallet
2. **Service Status:** The wallet will show service availability
3. **Token Balances:** View your BRC-20 token holdings
4. **Token Explorer:** Browse all available BRC-20 tokens

## API Endpoints

Once running, the following endpoints are available:

- **Health Check:** `GET /v1/indexer/brc20/health`
- **List Tokens:** `GET /v1/indexer/brc20/list`
- **Token Details:** `GET /v1/indexer/brc20/{tick}`
- **User Balances:** `GET /v1/indexer/brc20/balances/{address}`
- **Transfers:** `GET /v1/indexer/brc20/transfers/{address}`
- **API Documentation:** `http://localhost:8080/docs`

## Testing the Integration

1. **Start Universal Wallet:**
   ```bash
   cd /Users/sacha/UNIVERSAL/universal-wallet
   npm run dev
   ```

2. **Start Simplicity Backend:**
   ```bash
   cd /Users/sacha/UNIVERSAL/simplicity-backend
   docker-compose up -d
   # OR for manual setup:
   pipenv run python run.py --continuous
   ```

3. **Open Universal Wallet:**
   - Navigate to `http://localhost:4000`
   - Click on the "BRC-20" button in the home page
   - You should see the BRC-20 tokens page with service status

## Troubleshooting

### Service Not Available
- Ensure Docker is running (for Docker setup)
- Check if port 8080 is available
- Verify PostgreSQL and Redis are running (for manual setup)

### Connection Issues
- Check CORS configuration in `.env`
- Verify the API host is set to `0.0.0.0` for Docker
- Ensure firewall isn't blocking port 8080

### Database Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Run migrations: `pipenv run alembic upgrade head`

## Universal Protocol Features

The Simplicity integration enables:

- **BRC-20 Token Support:** View and manage BRC-20 tokens
- **Real-time Indexing:** Up-to-date token data
- **Balance Tracking:** Monitor token balances across addresses
- **Transfer History:** View BRC-20 transfer transactions
- **Token Discovery:** Explore new and existing tokens

## Development

For development with the Universal Wallet:

1. Both services use hot reloading
2. Universal Wallet automatically reconnects to Simplicity
3. API changes are reflected immediately
4. Use the refresh button in the BRC-20 page to reload data

## Production Deployment

For production deployment:

1. **Security:** Change all default passwords in `.env`
2. **Database:** Use managed PostgreSQL service
3. **Redis:** Use managed Redis service
4. **Monitoring:** Enable metrics on port 9090
5. **SSL:** Configure HTTPS for production

## Support

- **Simplicity Repository:** https://github.com/The-Universal-BRC-20-Extension/Simplicity
- **Universal Wallet:** The wallet includes built-in status checking and error messages
- **API Documentation:** Available at `http://localhost:8080/docs` when running