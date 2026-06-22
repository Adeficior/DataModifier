import { mock, type Mock } from "bun:test";
import type { Logger } from "../../src/logger.js";
import { wrapLogMethods } from "../../src/logger.js";

export interface TestLogger extends Logger {
  reset(): void;
  info: Mock<Logger["info"]>;
  warn: Mock<Logger["warn"]>;
  error: Mock<Logger["error"]>;
}

export default function createTestLogger(): TestLogger {
  const logger = wrapLogMethods({
    error: mock(),
    warn: mock(),
    info: mock(),
  }) as TestLogger;

  logger.reset = () => {
    logger.info.mockReset();
    logger.warn.mockReset();
    logger.error.mockReset();
  };

  return logger;
}
