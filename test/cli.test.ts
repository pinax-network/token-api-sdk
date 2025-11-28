/**
 * CLI Tests
 *
 * Unit tests for the @pinax/token-api CLI retry and auto-pagination features.
 */

import { describe, it, expect } from 'bun:test';
import { spawn } from 'child_process';
import { resolve } from 'path';

const CLI_PATH = resolve(__dirname, '../bin/cli.ts');

// Helper function to run CLI commands
function runCli(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn('bun', ['run', CLI_PATH, ...args]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

describe('CLI', () => {
  describe('Global options', () => {
    it('should show --max-retries option in help', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout).toContain('--max-retries <number>');
      expect(result.stdout).toContain('Maximum number of retry attempts');
      expect(result.code).toBe(0);
    });

    it('should show --timeout-ms option in help', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout).toContain('--timeout-ms <number>');
      expect(result.stdout).toContain('Timeout in milliseconds');
      expect(result.code).toBe(0);
    });

    it('should show --auto-paginate option in help', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout).toContain('--auto-paginate');
      expect(result.stdout).toContain('Automatically paginate');
      expect(result.code).toBe(0);
    });

    it('should show default value for --max-retries', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout).toContain('default: "3"');
      expect(result.code).toBe(0);
    });

    it('should show default value for --timeout-ms', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout).toContain('default: "10000"');
      expect(result.code).toBe(0);
    });
  });

  describe('Subcommands', () => {
    it('should show EVM subcommand', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout).toContain('evm');
      expect(result.stdout).toContain('EVM (Ethereum Virtual Machine) operations');
      expect(result.code).toBe(0);
    });

    it('should show SVM subcommand', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout).toContain('svm');
      expect(result.stdout).toContain('SVM (Solana Virtual Machine) operations');
      expect(result.code).toBe(0);
    });

    it('should show TVM subcommand', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout).toContain('tvm');
      expect(result.stdout).toContain('TVM (Tron Virtual Machine) operations');
      expect(result.code).toBe(0);
    });

    it('should show monitoring subcommand', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout).toContain('monitoring');
      expect(result.stdout).toContain('API monitoring and status');
      expect(result.code).toBe(0);
    });
  });

  describe('EVM Tokens commands', () => {
    it('should show transfers command help', async () => {
      const result = await runCli(['evm', 'tokens', 'transfers', '--help']);
      expect(result.stdout).toContain('--network <network>');
      expect(result.stdout).toContain('--limit <number>');
      expect(result.stdout).toContain('--page <number>');
      expect(result.code).toBe(0);
    });
  });

  describe('Monitoring commands', () => {
    it('should show health command', async () => {
      const result = await runCli(['monitoring', '--help']);
      expect(result.stdout).toContain('health');
      expect(result.stdout).toContain('Check API health status');
      expect(result.code).toBe(0);
    });

    it('should show version command', async () => {
      const result = await runCli(['monitoring', '--help']);
      expect(result.stdout).toContain('version');
      expect(result.stdout).toContain('Get API version information');
      expect(result.code).toBe(0);
    });

    it('should show networks command', async () => {
      const result = await runCli(['monitoring', '--help']);
      expect(result.stdout).toContain('networks');
      expect(result.stdout).toContain('Get list of supported networks');
      expect(result.code).toBe(0);
    });
  });
});
