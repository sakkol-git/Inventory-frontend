// ═══════════════════════════════════════════════════════════════════════════
// Transaction — API types (read-only)
// ═══════════════════════════════════════════════════════════════════════════

import type { TransactionAction } from '@/shared/types/enums';

export interface TransactionApi {
  id: number;
  action: TransactionAction;
  quantity: string | null; // decimal as string
  note: string | null;
  user: { id: number; name: string } | null;
  item: {
    type: string;
    id: number;
    data: unknown;
  };
  created_at: string;
}
