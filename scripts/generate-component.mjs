#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Component Generator — Scaffolds new components following governance rules.
 *
 * Usage:
 *   node scripts/generate-component.mjs ui Button
 *   node scripts/generate-component.mjs shared QuickFilter
 *   node scripts/generate-component.mjs composed InventoryCard
 *
 * Generates:
 *   - Component file with correct boilerplate
 *   - Updates barrel export (index.ts)
 *   - Follows naming conventions and tier rules
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "..", "src");

const TIERS = {
  ui: {
    path: "components/ui",
    description: "shadcn/ui primitive",
    template: "primitive",
  },
  shared: {
    path: "components/shared",
    description: "App-level reusable widget",
    template: "shared",
  },
  composed: {
    path: "components/composed",
    description: "Multi-primitive composition",
    template: "composed",
  },
  layout: {
    path: "components/layout",
    description: "Page shell / structural wrapper",
    template: "layout",
  },
};

// ─── Templates ─────────────────────────────────────────────────────────────

function sharedTemplate(name) {
  return `import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ${name}Props {
  className?: string;
  children?: ReactNode;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ${name}({ className, children }: ${name}Props) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}
`;
}

function composedTemplate(name) {
  return `import { type ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ${name}Props {
  className?: string;
  children?: ReactNode;
}

// ─── Component ─────────────────────────────────────────────────────────────

function ${name}Inner({ className, children }: ${name}Props) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export const ${name} = memo(${name}Inner);
`;
}

function layoutTemplate(name) {
  return `import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ${name}Props {
  className?: string;
  children: ReactNode;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ${name}({ className, children }: ${name}Props) {
  return (
    <div className={cn('min-h-screen', className)}>
      {children}
    </div>
  );
}
`;
}

function primitiveTemplate(name) {
  return `import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const ${name.toLowerCase()}Variants = cva('', {
  variants: {
    variant: {
      default: '',
    },
    size: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ${name}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ${name.toLowerCase()}Variants> {}

const ${name} = React.forwardRef<HTMLDivElement, ${name}Props>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(${name.toLowerCase()}Variants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
${name}.displayName = '${name}';

export { ${name}, ${name.toLowerCase()}Variants };
`;
}

const templates = {
  primitive: primitiveTemplate,
  shared: sharedTemplate,
  composed: composedTemplate,
  layout: layoutTemplate,
};

// ─── Main ──────────────────────────────────────────────────────────────────

const [, , tier, name] = process.argv;

if (!tier || !name) {
  console.error(
    "Usage: node scripts/generate-component.mjs <tier> <ComponentName>",
  );
  console.error("Tiers: ui, shared, composed, layout");
  process.exit(1);
}

if (!TIERS[tier]) {
  console.error(
    `Unknown tier: "${tier}". Valid tiers: ${Object.keys(TIERS).join(", ")}`,
  );
  process.exit(1);
}

if (!/^[A-Z][a-zA-Z0-9]+$/.test(name)) {
  console.error(`Component name must be PascalCase: "${name}"`);
  process.exit(1);
}

const tierConfig = TIERS[tier];
const componentDir = join(srcDir, tierConfig.path);
const componentFile = join(componentDir, `${name}.tsx`);

if (existsSync(componentFile)) {
  console.error(`Component already exists: ${componentFile}`);
  process.exit(1);
}

// Ensure directory exists
if (!existsSync(componentDir)) {
  mkdirSync(componentDir, { recursive: true });
}

// Write component file
const templateFn = templates[tierConfig.template];
writeFileSync(componentFile, templateFn(name), "utf-8");
console.log(`✓ Created ${componentFile}`);

// Update barrel export (if index.ts exists)
const indexFile = join(componentDir, "index.ts");
if (existsSync(indexFile)) {
  const indexContent = readFileSync(indexFile, "utf-8");
  const exportLine = `export { ${name} } from "./${name}";\n`;

  if (!indexContent.includes(exportLine.trim())) {
    writeFileSync(
      indexFile,
      indexContent.trimEnd() + "\n" + exportLine,
      "utf-8",
    );
    console.log(`✓ Updated barrel export: ${indexFile}`);
  }
} else {
  const exportLine = `export { ${name} } from "./${name}";\n`;
  writeFileSync(indexFile, exportLine, "utf-8");
  console.log(`✓ Created barrel export: ${indexFile}`);
}

console.log(
  `\nComponent "${name}" created in ${tierConfig.path}/ (${tierConfig.description})`,
);
