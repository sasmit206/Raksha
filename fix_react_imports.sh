#!/bin/bash
cd frontend/src/pages

for file in *.tsx; do
    if grep -q "useState" "$file" || grep -q "useEffect" "$file"; then
        if ! grep -q "from 'react'" "$file"; then
            # Needs react import!
            sed -i '' '1s/^/import { useState, useEffect } from '\''react'\'';\n/' "$file"
        fi
    fi
done

# Check if any have React.useState
for file in *.tsx; do
    if grep -q "React.useState" "$file"; then
        if ! grep -q "import React" "$file"; then
            sed -i '' '1s/^/import React from '\''react'\'';\n/' "$file"
        fi
    fi
done
