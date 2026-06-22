import { beforeEach, describe, expect, it, mock } from "bun:test";
import chalk from "chalk";
import { createLogger } from "../src/index.js";

beforeEach(() => {
  console.info = mock();
  console.warn = mock();
  console.error = mock();
});

describe("tests regarding the logger", () => {
  it("default logger prints console", () => {
    const logger = createLogger();

    const error = new Error("the message");
    logger.info("Info Test");
    logger.warn("Some Warning");
    logger.error("An Error Occured", error);

    expect(console.info).toHaveBeenCalledWith(chalk.green("Info Test"));
    expect(console.warn).toHaveBeenCalledWith(chalk.yellow("Some Warning"));
    expect(console.error).toHaveBeenCalledWith(
      chalk.red("An Error Occured"),
      error,
    );
  });

  it("grouped logger prefixes spaces", () => {
    const logger = createLogger();

    logger.info("Before");

    const prefixed = logger.group();

    const error = new Error("the message");
    prefixed.info("Info Test");
    prefixed.warn("Some Warning");
    prefixed.error("An Error Occured", error);

    logger.info("After");

    expect(console.info).toHaveBeenCalledWith(chalk.green("Before"));
    expect(console.info).toHaveBeenCalledWith(chalk.green("After"));
    expect(console.info).toHaveBeenCalledWith(chalk.green("   Info Test"));
    expect(console.warn).toHaveBeenCalledWith(chalk.yellow("   Some Warning"));
    expect(console.error).toHaveBeenCalledWith(
      chalk.red("   An Error Occured"),
      error,
    );
  });

  it("grouped logger adds prefix", () => {
    const logger = createLogger().group("prefix");

    const error = new Error("the message");
    logger.info("Info Test");
    logger.warn("Some Warning");
    logger.error("An Error Occured", error);

    expect(console.info).toHaveBeenCalledWith(
      chalk.green("prefix -> Info Test"),
    );
    expect(console.warn).toHaveBeenCalledWith(
      chalk.yellow("prefix -> Some Warning"),
    );
    expect(console.error).toHaveBeenCalledWith(
      chalk.red("prefix -> An Error Occured"),
      error,
    );
  });
});
