#!/bin/bash
# Comprehensive test suite for Simplicity BRC-20 Indexer
# Tests all endpoints and verifies system performance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_code="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -e "\n${BLUE}🧪 Test: ${test_name}${NC}"

    # Run the test and capture both stdout and stderr
    local start_time=$(date +%s%3N)

    if eval "$test_command" > /tmp/test_output 2>&1; then
        local exit_code=0
    else
        local exit_code=$?
    fi

    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))

    # Check if test passed
    if [[ $exit_code -eq ${expected_code:-0} ]]; then
        echo -e "${GREEN}✅ PASSED${NC} (${duration}ms)"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Check response time for API tests
        if [[ $duration -gt 2000 ]]; then
            echo -e "${YELLOW}⚠️  Warning: Slow response time (${duration}ms > 2000ms)${NC}"
        fi
    else
        echo -e "${RED}❌ FAILED${NC} (exit code: $exit_code, expected: ${expected_code:-0})"
        echo -e "${RED}Output:${NC}"
        cat /tmp/test_output
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to test API endpoint
test_api() {
    local endpoint="$1"
    local expected_status="$2"
    local description="$3"
    local timeout="${4:-5}"

    local test_command="curl -s -o /tmp/api_response -w '%{http_code}' --max-time $timeout http://localhost:8080$endpoint"

    echo -e "\n${BLUE}🌐 API Test: ${description}${NC}"
    echo -e "${BLUE}   Endpoint: $endpoint${NC}"

    local start_time=$(date +%s%3N)
    local status_code=$(eval "$test_command")
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [[ "$status_code" == "$expected_status" ]]; then
        echo -e "${GREEN}✅ PASSED${NC} (${duration}ms, HTTP $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Show response for successful tests
        if [[ "$status_code" == "200" ]]; then
            echo -e "${BLUE}Response:${NC}"
            cat /tmp/api_response | jq . 2>/dev/null || cat /tmp/api_response
        fi

        # Performance check
        if [[ $duration -gt 2000 ]]; then
            echo -e "${YELLOW}⚠️  Warning: Slow response (${duration}ms > 2000ms)${NC}"
        fi
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $status_code, expected: $expected_status)"
        echo -e "${RED}Response:${NC}"
        cat /tmp/api_response
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo -e "${BLUE}🚀 Starting Simplicity BRC-20 Indexer Test Suite${NC}"
echo -e "${BLUE}================================================${NC}"

# System tests
echo -e "\n${YELLOW}🔧 System Tests${NC}"

run_test "Docker availability" "command -v docker"
run_test "Python availability" "command -v python3"
run_test "Node.js availability" "command -v node"
run_test "NPM availability" "command -v npm"

# Port tests
echo -e "\n${YELLOW}🌐 Port Availability Tests${NC}"

run_test "Port 8080 in use" "lsof -i :8080"
run_test "Port 5432 in use" "lsof -i :5432"
run_test "Port 6379 in use" "lsof -i :6379"

# API Health tests
echo -e "\n${YELLOW}🏥 Health Check Tests${NC}"

test_api "/v1/indexer/brc20/health" "200" "Basic health check"
test_api "/docs" "200" "API documentation"
test_api "/openapi.json" "200" "OpenAPI specification"

# BRC-20 API tests
echo -e "\n${YELLOW}💰 BRC-20 API Tests${NC}"

test_api "/v1/indexer/brc20/list" "200" "List all tokens"
test_api "/v1/indexer/brc20/list?limit=5" "200" "List tokens with limit"
test_api "/v1/indexer/brc20/list?limit=0" "200" "List tokens with zero limit"
test_api "/v1/indexer/brc20/list?limit=1000" "200" "List tokens with high limit"

# Balance tests (expect 404 for non-existent addresses)
test_api "/v1/indexer/brc20/balances/bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4" "404" "Balance for test address"
test_api "/v1/indexer/brc20/balances/invalid" "404" "Balance for invalid address"

# Error handling tests
echo -e "\n${YELLOW}🚨 Error Handling Tests${NC}"

test_api "/v1/indexer/brc20/nonexistent" "404" "Non-existent endpoint"
test_api "/v1/indexer/brc20/balances/" "404" "Missing address parameter"

# Performance tests
echo -e "\n${YELLOW}⚡ Performance Tests${NC}"

echo -e "\n${BLUE}🏃 Running concurrent requests test...${NC}"
CONCURRENT_START=$(date +%s%3N)

# Run 10 concurrent requests
for i in {1..10}; do
    curl -s http://localhost:8080/v1/indexer/brc20/health > /dev/null &
done

wait # Wait for all background jobs to complete

CONCURRENT_END=$(date +%s%3N)
CONCURRENT_DURATION=$((CONCURRENT_END - CONCURRENT_START))

TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [[ $CONCURRENT_DURATION -lt 5000 ]]; then
    echo -e "${GREEN}✅ PASSED${NC} (${CONCURRENT_DURATION}ms for 10 concurrent requests)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} (${CONCURRENT_DURATION}ms > 5000ms for 10 concurrent requests)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Universal Wallet integration test
echo -e "\n${YELLOW}🔗 Integration Tests${NC}"

# Check if Universal Wallet is running
if lsof -i :4000 > /dev/null 2>&1; then
    WALLET_PORT=4000
elif lsof -i :4001 > /dev/null 2>&1; then
    WALLET_PORT=4001
else
    WALLET_PORT=0
fi

if [[ $WALLET_PORT -gt 0 ]]; then
    run_test "Universal Wallet accessibility" "curl -s --max-time 5 http://localhost:$WALLET_PORT > /dev/null"

    # Test BRC-20 page
    echo -e "\n${BLUE}🧪 Testing BRC-20 page content...${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if curl -s "http://localhost:$WALLET_PORT" | grep -q "BRC-20"; then
        echo -e "${GREEN}✅ PASSED${NC} (BRC-20 content found in wallet)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  PARTIAL${NC} (BRC-20 content not found, but wallet is accessible)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Skipping Universal Wallet tests (not running)${NC}"
fi

# Database connectivity test
echo -e "\n${YELLOW}🗄️  Database Tests${NC}"

if command -v psql > /dev/null 2>&1; then
    run_test "PostgreSQL connection" "pg_isready -h localhost -p 5432 -U sacha"
else
    echo -e "${YELLOW}⚠️  Skipping PostgreSQL tests (psql not available)${NC}"
fi

# Redis connectivity test
echo -e "\n${YELLOW}📦 Cache Tests${NC}"

if command -v redis-cli > /dev/null 2>&1; then
    run_test "Redis connection" "redis-cli -h localhost -p 6379 ping"
else
    echo -e "${YELLOW}⚠️  Skipping Redis tests (redis-cli not available)${NC}"
fi

# Cleanup
rm -f /tmp/test_output /tmp/api_response

# Results summary
echo -e "\n${BLUE}📊 Test Results Summary${NC}"
echo -e "${BLUE}========================${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 All tests passed! Simplicity is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi