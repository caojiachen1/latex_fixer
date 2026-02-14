import { invoke } from '@tauri-apps/api/core';

export interface FileContent {
  path: string;
  content: string;
}

export async function readMarkdownFile(path: string): Promise<FileContent> {
  return invoke<FileContent>('read_markdown_file', { path });
}

export async function writeMarkdownFile(path: string, content: string): Promise<void> {
  return invoke<void>('write_markdown_file', { path, content });
}

export async function proxyLLMRequest(
  url: string,
  method?: string,
  body?: string,
  headers?: Record<string, string>
): Promise<string> {
  return invoke<string>('proxy_llm_request', { url, method, body, headers });
}

export async function getStartupArgs(): Promise<string[]> {
  return invoke<string[]>('get_startup_args');
}
