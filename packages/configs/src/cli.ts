#!/usr/bin/env bun

import arg from "arg";
import { generateTypes } from "./codegen";
import generateConfigs from "./lib";
import { prunePackage } from "./prune";

const args = arg({
  "--configs": Boolean,
  "--types": Boolean,
  "--prune": Boolean,
  "--dry-run": Boolean,
});

const dryRun = args["--dry-run"];

if (args["--configs"]) {
  await generateConfigs(".");
}

if (args["--types"]) {
  await generateTypes(".");
}

if (args["--prune"]) {
  await prunePackage(".", dryRun);
}
