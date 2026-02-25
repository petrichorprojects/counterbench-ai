export type LegalPadItemType = "tool" | "prompt" | "skill";

export type VoteValue = -1 | 0 | 1;

export interface LegalPadItem {
  type: LegalPadItemType;
  slug: string;
  title: string;
  description?: string;
  savedAtIso: string;
}

interface VoteRecord {
  value: VoteValue;
  updatedAtIso: string;
}

const LEGAL_PAD_KEY = "cb_legal_pad_v1";
const VOTES_KEY = "cb_votes_v1";

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function emit(name: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name));
}

function itemKey(type: LegalPadItemType, slug: string): string {
  return `${type}:${slug}`;
}

export function loadLegalPad(): LegalPadItem[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParseJson<Record<string, LegalPadItem>>(window.localStorage.getItem(LEGAL_PAD_KEY));
  const values = parsed ? Object.values(parsed) : [];
  return values
    .filter((x) => x && x.type && x.slug && x.title)
    .sort((a, b) => (b.savedAtIso || "").localeCompare(a.savedAtIso || ""));
}

export function isSaved(type: LegalPadItemType, slug: string): boolean {
  if (typeof window === "undefined") return false;
  const parsed = safeParseJson<Record<string, LegalPadItem>>(window.localStorage.getItem(LEGAL_PAD_KEY));
  if (!parsed) return false;
  return Boolean(parsed[itemKey(type, slug)]);
}

export function toggleSaved(item: Omit<LegalPadItem, "savedAtIso">): boolean {
  if (typeof window === "undefined") return false;
  const parsed = safeParseJson<Record<string, LegalPadItem>>(window.localStorage.getItem(LEGAL_PAD_KEY)) ?? {};
  const key = itemKey(item.type, item.slug);

  if (parsed[key]) {
    delete parsed[key];
    window.localStorage.setItem(LEGAL_PAD_KEY, JSON.stringify(parsed));
    emit("cb:legalpad");
    return false;
  }

  parsed[key] = {
    ...item,
    savedAtIso: new Date().toISOString()
  };

  window.localStorage.setItem(LEGAL_PAD_KEY, JSON.stringify(parsed));
  emit("cb:legalpad");
  return true;
}

export function clearLegalPad(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGAL_PAD_KEY);
  emit("cb:legalpad");
}

export function getVote(type: LegalPadItemType, slug: string): VoteValue {
  if (typeof window === "undefined") return 0;
  const parsed = safeParseJson<Record<string, VoteRecord>>(window.localStorage.getItem(VOTES_KEY)) ?? {};
  const rec = parsed[itemKey(type, slug)];
  if (!rec) return 0;
  if (rec.value !== -1 && rec.value !== 0 && rec.value !== 1) return 0;
  return rec.value;
}

export function setVote(type: LegalPadItemType, slug: string, value: VoteValue): VoteValue {
  if (typeof window === "undefined") return 0;
  const parsed = safeParseJson<Record<string, VoteRecord>>(window.localStorage.getItem(VOTES_KEY)) ?? {};
  const key = itemKey(type, slug);

  parsed[key] = {
    value,
    updatedAtIso: new Date().toISOString()
  };

  window.localStorage.setItem(VOTES_KEY, JSON.stringify(parsed));
  emit("cb:votes");
  return value;
}
