// Browser entry point — exposes ToxiBR on window
import { filterContent, createFilter, normalize } from './filter';
import { HARD_BLOCKED, CONTEXT_SENSITIVE } from './wordlists';

(window as any).ToxiBR = {
  filterContent,
  createFilter,
  normalize,
  HARD_BLOCKED,
  CONTEXT_SENSITIVE,
};
