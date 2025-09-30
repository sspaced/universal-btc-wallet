#!/usr/bin/env python3
"""
Simplicity BRC-20 Indexer Health Monitor
Continuously monitors indexer health and auto-restarts on failure
"""

import asyncio
import logging
import time
import subprocess
import json
from typing import Dict, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import aiohttp
import structlog


# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@dataclass
class ServiceConfig:
    """Configuration for monitoring services"""
    name: str
    url: str
    port: int
    health_endpoint: str
    restart_command: str
    max_failures: int = 3
    timeout: int = 10
    check_interval: int = 30


@dataclass
class HealthStatus:
    """Health status of a service"""
    is_healthy: bool
    response_time: float
    status_code: Optional[int] = None
    error: Optional[str] = None
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


class SimpleHealtMonitor:
    """Health monitor for Simplicity services"""

    def __init__(self):
        self.services = {
            'simplicity_api': ServiceConfig(
                name='Simplicity API',
                url='http://localhost:8080',
                port=8080,
                health_endpoint='/v1/indexer/brc20/health',
                restart_command='cd /Users/sacha/UNIVERSAL/simplicity-backend && pipenv run uvicorn src.api.main:app --host 0.0.0.0 --port 8080'
            ),
            'universal_wallet': ServiceConfig(
                name='Universal Wallet',
                url='http://localhost:4001',
                port=4001,
                health_endpoint='/',
                restart_command='cd /Users/sacha/UNIVERSAL/universal-wallet && npm run dev'
            )
        }

        self.failure_counts: Dict[str, int] = {name: 0 for name in self.services}
        self.last_restart: Dict[str, datetime] = {}
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=10)
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    async def check_service_health(self, service_key: str) -> HealthStatus:
        """Check health of a specific service"""
        service = self.services[service_key]
        url = f"{service.url}{service.health_endpoint}"

        start_time = time.time()

        try:
            async with self.session.get(url) as response:
                response_time = time.time() - start_time

                if response.status == 200:
                    # Additional check for API content
                    if service_key == 'simplicity_api':
                        data = await response.json()
                        if data.get('status') == 'healthy':
                            return HealthStatus(True, response_time, response.status)
                        else:
                            return HealthStatus(False, response_time, response.status, "Unhealthy status in response")
                    else:
                        return HealthStatus(True, response_time, response.status)
                else:
                    return HealthStatus(False, response_time, response.status, f"HTTP {response.status}")

        except asyncio.TimeoutError:
            response_time = time.time() - start_time
            return HealthStatus(False, response_time, None, "Request timeout")
        except aiohttp.ClientError as e:
            response_time = time.time() - start_time
            return HealthStatus(False, response_time, None, f"Connection error: {str(e)}")
        except Exception as e:
            response_time = time.time() - start_time
            return HealthStatus(False, response_time, None, f"Unexpected error: {str(e)}")

    def should_restart_service(self, service_key: str) -> bool:
        """Determine if a service should be restarted"""
        service = self.services[service_key]

        # Check if we've exceeded max failures
        if self.failure_counts[service_key] < service.max_failures:
            return False

        # Check if we've recently restarted (avoid restart loops)
        last_restart = self.last_restart.get(service_key)
        if last_restart and datetime.now() - last_restart < timedelta(minutes=5):
            return False

        return True

    async def restart_service(self, service_key: str) -> bool:
        """Restart a failed service"""
        service = self.services[service_key]

        logger.warning(
            "Attempting to restart service",
            service=service.name,
            failure_count=self.failure_counts[service_key]
        )

        try:
            # Kill existing process on port
            kill_cmd = f"lsof -ti:{service.port} | xargs kill -9"
            subprocess.run(kill_cmd, shell=True, capture_output=True)

            # Wait a moment
            await asyncio.sleep(2)

            # Start new process
            subprocess.Popen(
                service.restart_command,
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            self.last_restart[service_key] = datetime.now()
            self.failure_counts[service_key] = 0

            logger.info(
                "Service restart initiated",
                service=service.name,
                command=service.restart_command
            )

            return True

        except Exception as e:
            logger.error(
                "Failed to restart service",
                service=service.name,
                error=str(e)
            )
            return False

    async def monitor_service(self, service_key: str):
        """Monitor a single service continuously"""
        service = self.services[service_key]

        while True:
            try:
                status = await self.check_service_health(service_key)

                if status.is_healthy:
                    if self.failure_counts[service_key] > 0:
                        logger.info(
                            "Service recovered",
                            service=service.name,
                            response_time=status.response_time,
                            previous_failures=self.failure_counts[service_key]
                        )

                    self.failure_counts[service_key] = 0

                    # Log healthy status periodically
                    if int(time.time()) % 300 == 0:  # Every 5 minutes
                        logger.info(
                            "Service healthy",
                            service=service.name,
                            response_time=status.response_time
                        )

                else:
                    self.failure_counts[service_key] += 1

                    logger.warning(
                        "Service health check failed",
                        service=service.name,
                        failure_count=self.failure_counts[service_key],
                        max_failures=service.max_failures,
                        error=status.error,
                        response_time=status.response_time
                    )

                    # Attempt restart if needed
                    if self.should_restart_service(service_key):
                        await self.restart_service(service_key)

                        # Wait longer after restart
                        await asyncio.sleep(30)
                        continue

                await asyncio.sleep(service.check_interval)

            except Exception as e:
                logger.error(
                    "Error in service monitoring",
                    service=service.name,
                    error=str(e)
                )
                await asyncio.sleep(service.check_interval)

    async def run_monitor(self):
        """Run the monitoring loop for all services"""
        logger.info("Starting Simplicity health monitor")

        # Create monitoring tasks for all services
        tasks = []
        for service_key in self.services:
            task = asyncio.create_task(self.monitor_service(service_key))
            tasks.append(task)

        try:
            await asyncio.gather(*tasks)
        except KeyboardInterrupt:
            logger.info("Monitor stopped by user")
        except Exception as e:
            logger.error("Monitor stopped due to error", error=str(e))
        finally:
            for task in tasks:
                task.cancel()

    def get_status_report(self) -> Dict:
        """Get current status report"""
        return {
            'timestamp': datetime.now().isoformat(),
            'services': {
                key: {
                    'name': service.name,
                    'failure_count': self.failure_counts[key],
                    'last_restart': self.last_restart.get(key).isoformat() if key in self.last_restart else None,
                    'url': f"{service.url}{service.health_endpoint}"
                }
                for key, service in self.services.items()
            }
        }


async def main():
    """Main function"""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(message)s'
    )

    async with SimpleHealtMonitor() as monitor:
        await monitor.run_monitor()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Monitor stopped")
    except Exception as e:
        print(f"❌ Error: {e}")