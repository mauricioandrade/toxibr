// ─── ToxiBR ──────────────────────────────────────────────────────────────────
// Biblioteca de moderação de conteúdo para português brasileiro.

export { filterContent, createFilter, normalize } from './filter';
export type { FilterResult, FilterReason, ToxiBROptions } from './types';
export {
  HARD_BLOCKED,
  CONTEXT_SENSITIVE,
  DIRECTED_PATTERNS,
  SELF_EXPRESSION_PATTERNS,
  ABBREVIATION_MAP,
  OFFENSIVE_EMOJIS,
  OFFENSIVE_EMOJI_SEQUENCES,
  CONTEXT_SENSITIVE_EMOJIS,
} from './wordlists';
