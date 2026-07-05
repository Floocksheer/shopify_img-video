"use client";

/**
 * Client-side generation history. In demo mode (no database) this is the
 * source of truth for the dashboard grid; in live mode it acts as an
 * instant local cache alongside the Supabase `generations` table.
 */

export interface GenerationRecord {
  id: string;
  type: "photo" | "video";
  url: string;
  theme: string;
  createdAt: string;
}

const KEY = "lumora_generations";
const MAX = 48;

export function getHistory(): GenerationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addToHistory(records: GenerationRecord[]) {
  if (typeof window === "undefined") return;
  const merged = [...records, ...getHistory()].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(merged));
}
