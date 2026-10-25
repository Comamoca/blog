/**
 * Deno の std/assert 互換アサーション (Vitest/Node 用)。
 *
 * jsr:@std/assert からの機械的移行を前提とした API 形状を保つ:
 *   assert(expr, msg?)            … assert.ok
 *   assertEquals(actual, expected, msg?) … assert.deepStrictEqual
 *   assertStringIncludes(s, sub, msg?)  … includes の成否
 *   assertExists(v, msg?)         … null/undefined でないこと
 *
 * Node の assert はメッセージ付きで失敗理由を出力するため、
 * 移行前の日本語メッセージがそのまま失敗時に表示される。
 */
import { deepStrictEqual, ok } from "node:assert/strict";

export function assert(expr: unknown, message?: string): void {
  ok(expr, message);
}

export function assertEquals(actual: unknown, expected: unknown, message?: string): void {
  deepStrictEqual(actual, expected, message);
}

export function assertStringIncludes(haystack: string, needle: string, message?: string): void {
  ok(haystack.includes(needle), message ?? `文字列が部分列を含むこと: ${JSON.stringify(needle)}`);
}

export function assertExists(value: unknown, message?: string): void {
  ok(value !== undefined && value !== null, message ?? `値が undefined/null でないこと`);
}
