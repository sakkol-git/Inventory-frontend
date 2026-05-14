// ═══════════════════════════════════════════════════════════════════════════
// GENERIC CRUD HOOK — Reusable State Management for Entities
// ═══════════════════════════════════════════════════════════════════════════
// Eliminates 240+ lines of duplicated code across Clients/Contracts/Payments

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

/**
 * Entity constraint - all entities must have id and createdAt
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
}

/**
 * CRUD operations interface
 */
export interface CRUDOperations<T extends BaseEntity> {
  items: T[];
  create: (dto: Omit<T, "id" | "createdAt">) => void;
  update: (id: string, dto: Partial<Omit<T, "id" | "createdAt">>) => void;
  delete: (id: string) => void;
  findById: (id: string) => T | undefined;
}

/**
 * Configuration for CRUD hook
 */
export interface CRUDConfig<T extends BaseEntity> {
  entityName: string; // e.g., "client", "contract", "payment"
  idGenerator: (index: number) => string;
  toastMessages?: {
    created?: (item: T) => string;
    updated?: (item: T) => string;
    deleted?: (item: T) => string;
  };
  onBeforeCreate?: (dto: Omit<T, "id" | "createdAt">) => Partial<T>;
  onBeforeUpdate?: (id: string, dto: Partial<T>) => Partial<T>;
}

/**
 * Generic CRUD hook with type safety
 * 
 * @example
 * const clientsCRUD = useCRUD<Client>({
 *   entityName: 'client',
 *   idGenerator: ID_GENERATORS.client,
 * }, initialClients);
 * 
 * clientsCRUD.create({ companyName: "Test", ... });
 * clientsCRUD.update("CLT-001", { companyName: "Updated" });
 * clientsCRUD.delete("CLT-001");
 */
export function useCRUD<T extends BaseEntity>(
  config: CRUDConfig<T>,
  initialData: T[] = []
): CRUDOperations<T> {
  const [items, setItems] = useState<T[]>(initialData);

  const { entityName, idGenerator, toastMessages, onBeforeCreate, onBeforeUpdate } = config;

  // Find item by ID
  const findById = useCallback((id: string): T | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  // Create new entity
  const create = useCallback((dto: Omit<T, "id" | "createdAt">) => {
    const maxIndex = items.length > 0 
      ? Math.max(...items.map(item => {
          const match = item.id.match(/-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        }))
      : 0;

    const newId = idGenerator(maxIndex + 1);
    const createdAt = new Date().toISOString().split("T")[0];

    let newItem: T = {
      ...dto,
      id: newId,
      createdAt,
    } as T;

    // Apply pre-create hook if provided
    if (onBeforeCreate) {
      const additionalData = onBeforeCreate(dto);
      newItem = { ...newItem, ...additionalData };
    }

    setItems(prev => [...prev, newItem]);

    const message = toastMessages?.created?.(newItem) || 
      `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} ${newId} created`;
    toast.success(message);

    return newItem;
  }, [items, idGenerator, entityName, toastMessages, onBeforeCreate]);

  // Update existing entity
  const update = useCallback((id: string, dto: Partial<Omit<T, "id" | "createdAt">>) => {
    let updatedData = { ...dto } as Partial<T>;

    // Apply pre-update hook if provided
    if (onBeforeUpdate) {
      const additionalData = onBeforeUpdate(id, updatedData);
      updatedData = { ...updatedData, ...additionalData };
    }

    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedData } : item
    ));

    const updatedItem = items.find(item => item.id === id);
    if (updatedItem) {
      const message = toastMessages?.updated?.({ ...updatedItem, ...updatedData } as T) || 
        `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} ${id} updated`;
      toast.success(message);
    }
  }, [items, entityName, toastMessages, onBeforeUpdate]);

  // Delete entity
  const deleteEntity = useCallback((id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    
    setItems(prev => prev.filter(item => item.id !== id));

    if (itemToDelete) {
      const message = toastMessages?.deleted?.(itemToDelete) || 
        `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} ${id} deleted`;
      toast.success(message);
    }
  }, [items, entityName, toastMessages]);

  return useMemo(() => ({
    items,
    create,
    update,
    delete: deleteEntity,
    findById,
  }), [items, create, update, deleteEntity, findById]);
}
