#!/bin/bash

# Fix duplicate imports in all tab files

echo "Fixing duplicate imports in tab components..."

# Fix AssetsTab.tsx
echo "Fixing AssetsTab.tsx..."
sed -i '1d' src/components/editor/tabs/AssetsTab.tsx # Remove the duplicate import type line

# Fix BasicInfoTab.tsx
echo "Fixing BasicInfoTab.tsx..."
sed -i '1d' src/components/editor/tabs/BasicInfoTab.tsx # Remove the duplicate import type line
sed -i 's/import { type DecorItem, DecorCategories }/import { DecorItem, DecorCategories }/' src/components/editor/tabs/BasicInfoTab.tsx

# Fix CollisionTab.tsx
echo "Fixing CollisionTab.tsx..."
sed -i '1d' src/components/editor/tabs/CollisionTab.tsx # Remove the duplicate import type line
sed -i 's/import { type DecorItem }/import { DecorItem }/' src/components/editor/tabs/CollisionTab.tsx

# Fix EconomicsTab.tsx
echo "Fixing EconomicsTab.tsx..."
sed -i '1d' src/components/editor/tabs/EconomicsTab.tsx # Remove the duplicate import type line
sed -i 's/import { type DecorItem }/import { DecorItem }/' src/components/editor/tabs/EconomicsTab.tsx

# Fix PhysicalTab.tsx
echo "Fixing PhysicalTab.tsx..."
sed -i '1d' src/components/editor/tabs/PhysicalTab.tsx # Remove the duplicate import type line
sed -i 's/import { type DecorItem, type BoxSize, boxSizeInfo }/import { DecorItem, BoxSize, boxSizeInfo }/' src/components/editor/tabs/PhysicalTab.tsx

echo "✅ Import fixes applied!"
