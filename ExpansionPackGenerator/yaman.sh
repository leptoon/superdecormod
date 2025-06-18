#!/bin/bash

# Update all tab components to use proper TypeScript types

echo "Updating all tab components with proper TypeScript types..."

# List of tab files to update
tabs=(
    "src/components/editor/tabs/BasicInfoTab.tsx"
    "src/components/editor/tabs/EconomicsTab.tsx"
    "src/components/editor/tabs/PhysicalTab.tsx"
    "src/components/editor/tabs/CollisionTab.tsx"
    "src/components/editor/tabs/AssetsTab.tsx"
)

for file in "${tabs[@]}"; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Replace the onChange type in the interface
        sed -i 's/onChange: (field: string, value: any) => void;/onChange: (field: keyof DecorItem, value: DecorItem[keyof DecorItem]) => void;/g' "$file"
        
        # Add type import if not present
        if ! grep -q "import type { DecorItem }" "$file"; then
            # Add after the first import statement
            sed -i '0,/^import/s/^import/import type { DecorItem } from '\''..\/..\/..\/types\/expansion'\'';\nimport/' "$file"
        fi
    fi
done

echo "✅ Tab components updated!"

# For components with nested changes (PhysicalTab and CollisionTab)
echo "Note: PhysicalTab.tsx and CollisionTab.tsx also have onNestedChange - update manually if needed"
