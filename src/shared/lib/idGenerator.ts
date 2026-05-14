// ═══════════════════════════════════════════════════════════════════════════
// ID GENERATOR UTILITY — Centralized Entity ID Creation
// ═══════════════════════════════════════════════════════════════════════════
// Eliminates magic strings and provides consistent ID generation across app

/**
 * Generates a unique ID with the specified prefix and zero-padded index
 * @param prefix Entity prefix (e.g., "CLT", "CON", "PAY")
 * @param index Numeric index (will be padded to 3 digits)
 * @returns Formatted ID string (e.g., "CLT-001")
 */
function generateId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

/**
 * Centralized ID generators for all business entities
 * Usage: ID_GENERATORS.client(5) => "CLT-005"
 */
export const ID_GENERATORS = {
  client: (index: number) => generateId("CLT", index),
  contract: (index: number) => generateId("CON", index),
  payment: (index: number) => generateId("PAY", index),
  experiment: (index: number) => generateId("EXP", index),
  species: (index: number) => generateId("SP", index),
  growthLog: (index: number) => generateId("LOG", index),
} as const;

/**
 * Extracts the numeric index from an ID string
 * @param id ID string (e.g., "CLT-042")
 * @returns Numeric index (e.g., 42)
 */
export function extractIdIndex(id: string): number {
  const match = id.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Gets the next ID in sequence based on existing IDs
 * @param existingIds Array of existing IDs
 * @param generator ID generator function
 * @returns Next available ID
 */
export function getNextId<T extends { id: string }>(
  existingItems: T[],
  generator: (index: number) => string
): string {
  if (existingItems.length === 0) {
    return generator(1);
  }
  
  const maxIndex = Math.max(
    ...existingItems.map(item => extractIdIndex(item.id))
  );
  
  return generator(maxIndex + 1);
}
