import os
filepath = 'frontend/src/layouts/MainLayout.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("React.useState", "useState")
content = content.replace("React.useEffect", "useEffect")

if "import { useState, useEffect }" not in content:
    content = "import { useState, useEffect } from 'react';\n" + content

with open(filepath, 'w') as f:
    f.write(content)
