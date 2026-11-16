// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 VREINN SAS
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
