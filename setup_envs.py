import os
import glob

# Create .env files
with open('frontend/.env.development', 'w') as f:
    f.write('VITE_API_URL=http://localhost:8000\n')

with open('frontend/.env.production', 'w') as f:
    f.write('VITE_API_URL=https://raksha-04bd.onrender.com\n')

# Find all TSX files and replace http://localhost:8000 with ${import.meta.env.VITE_API_URL}
base_dir = "frontend/src"
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r') as file_read:
                content = file_read.read()
            
            # Special case for fetch('http://localhost:8000/api/...')
            # Change to fetch(`${import.meta.env.VITE_API_URL}/api/...`)
            if "'http://localhost:8000" in content:
                content = content.replace("'http://localhost:8000", "`${import.meta.env.VITE_API_URL}")
                # We need to change the closing quote of that string from ' to `
                # This regex finds `${import.meta.env.VITE_API_URL}/... ' and replaces the trailing ' with `
                import re
                content = re.sub(r'(`\$\{import\.meta\.env\.VITE_API_URL\}[^\']*)\'', r'\1`', content)
            
            # Special case for fetch(`http://localhost:8000/api/...`)
            if "`http://localhost:8000" in content:
                content = content.replace("`http://localhost:8000", "`${import.meta.env.VITE_API_URL}")

            with open(filepath, 'w') as file_write:
                file_write.write(content)

print("Environment variables configured.")
