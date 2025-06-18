#!/bin/bash

# Script to quickly fix common TypeScript warnings

echo "🔧 Fixing TypeScript 'any' warnings..."

# Fix onChange handlers in tab components
find src/components/editor/tabs -name "*.tsx" -type f | while read file; do
    echo "Fixing $file..."
    # Replace (field: string, value: any) with proper types
    sed -i 's/onChange: (field: string, value: any)/onChange: (field: keyof DecorItem, value: DecorItem[keyof DecorItem])/g' "$file"
done

# Fix ItemEditor.tsx
echo "Fixing ItemEditor.tsx..."
sed -i 's/onChange: (field: string, value: any)/onChange: (field: keyof DecorItem, value: DecorItem[keyof DecorItem])/g' src/components/editor/ItemEditor.tsx
sed -i 's/const handleChange = (field: string, value: any)/const handleChange = (field: keyof DecorItem, value: DecorItem[keyof DecorItem])/g' src/components/editor/ItemEditor.tsx

# Fix main.tsx
echo "Fixing main.tsx..."
sed -i "s/document.getElementById('root')!/document.getElementById('root') as HTMLElement/g" src/main.tsx

echo "✅ Basic fixes applied!"
echo ""
echo "Remaining manual fixes needed:"
echo "1. Move buttonVariants to a separate file"
echo "2. Fix React hooks dependencies in BasicInfoTab.tsx"
echo "3. Add null checks in projectGenerator.ts"
echo ""
echo "Or use the relaxed ESLint config to turn these into non-blocking warnings."
