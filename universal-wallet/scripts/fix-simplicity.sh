#!/bin/bash
# Simplicity BRC-20 Indexer Fix Script
# Automatically diagnoses and fixes common issues

set -e

echo "🔍 Diagnosing Simplicity BRC-20 Indexer..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "src" ]]; then
    echo -e "${RED}❌ Error: Please run this script from the universal-wallet directory${NC}"
    exit 1
fi

echo -e "${BLUE}📍 Current directory: $(pwd)${NC}"

# Function to check service status
check_service() {
    local url=$1
    local name=$2

    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not accessible${NC}"
        return 1
    fi
}

# Function to check process
check_process() {
    local port=$1
    local name=$2

    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}❌ No process on port $port${NC}"
        return 1
    fi
}

echo -e "\n${YELLOW}🔍 Checking Services...${NC}"

# Check Universal Wallet
if check_process 4001 "Universal Wallet"; then
    WALLET_URL="http://localhost:4001"
elif check_process 4000 "Universal Wallet"; then
    WALLET_URL="http://localhost:4000"
else
    echo -e "${YELLOW}⚠️  Universal Wallet not running. Starting...${NC}"
    npm run dev &
    sleep 3
    WALLET_URL="http://localhost:4000"
fi

# Check Simplicity API
if ! check_service "http://localhost:8080/v1/indexer/brc20/health" "Simplicity API"; then
    echo -e "${YELLOW}⚠️  Starting Simplicity API...${NC}"

    # Navigate to simplicity-backend if it exists
    if [[ -d "../simplicity-backend" ]]; then
        cd ../simplicity-backend

        # Check if Docker is available
        if command -v docker-compose > /dev/null 2>&1; then
            echo -e "${BLUE}🐳 Using Docker Compose...${NC}"
            docker-compose up -d
        else
            echo -e "${BLUE}🐍 Using Python/pipenv...${NC}"
            # Check if pipenv is installed
            if ! command -v pipenv > /dev/null 2>&1; then
                echo -e "${YELLOW}Installing pipenv...${NC}"
                pip3 install pipenv
            fi

            # Install dependencies if needed
            if [[ ! -d ".venv" ]]; then
                echo -e "${YELLOW}Installing Python dependencies...${NC}"
                pipenv install --dev
            fi

            # Start the API server
            pipenv run uvicorn src.api.main:app --host 0.0.0.0 --port 8080 &
        fi

        cd - # Go back to universal-wallet
    else
        echo -e "${RED}❌ Simplicity backend directory not found${NC}"
        exit 1
    fi

    # Wait for service to start
    echo -e "${YELLOW}⏳ Waiting for API to start...${NC}"
    for i in {1..30}; do
        if check_service "http://localhost:8080/v1/indexer/brc20/health" "Simplicity API" > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done
fi

echo -e "\n${YELLOW}🧪 Testing API Endpoints...${NC}"

# Test health endpoint
if curl -s "http://localhost:8080/v1/indexer/brc20/health" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health endpoint working${NC}"
else
    echo -e "${RED}❌ Health endpoint failed${NC}"
fi

# Test list endpoint
if curl -s "http://localhost:8080/v1/indexer/brc20/list" > /dev/null; then
    echo -e "${GREEN}✅ List endpoint working${NC}"
else
    echo -e "${RED}❌ List endpoint failed${NC}"
fi

echo -e "\n${YELLOW}🔧 Clearing Browser Cache...${NC}"

# Clear Vite cache
if [[ -d "node_modules/.vite" ]]; then
    rm -rf node_modules/.vite
    echo -e "${GREEN}✅ Cleared Vite cache${NC}"
fi

echo -e "\n${GREEN}🎉 Fix Complete!${NC}"
echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo -e "1. Open your browser to: ${WALLET_URL}"
echo -e "2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)"
echo -e "3. Navigate to the BRC-20 page"
echo -e "4. The service should now show as available"

echo -e "\n${BLUE}🔗 Useful URLs:${NC}"
echo -e "• Universal Wallet: ${WALLET_URL}"
echo -e "• Simplicity API: http://localhost:8080"
echo -e "• API Health: http://localhost:8080/v1/indexer/brc20/health"
echo -e "• API Docs: http://localhost:8080/docs"

echo -e "\n${YELLOW}💡 Troubleshooting:${NC}"
echo -e "• If still not working, check browser console for errors"
echo -e "• Try incognito/private browsing mode"
echo -e "• Restart both services if needed"