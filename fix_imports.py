import os
import re

src_dir = '/home/kihi2024/Downloads/kihicode/src'

# Regex to match relative imports/exports
# Matches: from './foo' or from "../foo"
# Does NOT match: from 'react' or from './foo.js'
relative_import_pattern = re.compile(r'(from\s+[\'"])(\.\.?/[^\'"]+)([\'"])')
side_effect_import_pattern = re.compile(r'(import\s+[\'"])(\.\.?/[^\'"]+)([\'"])')

def fix_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    def replace_func(match):
        prefix = match.group(1)
        path = match.group(2)
        suffix = match.group(3)
        
        # If path already has an extension (like .js, .css, .json, .png etc)
        # we might want to skip it, but the user specifically asked for .js extensions for TS files.
        # TS usually doesn't have other extensions in imports in this project based on grep.
        if not path.endswith('.js'):
            # Check if it's a directory import that might need index.js
            # But the user's instructions were simple: append .js
            return f"{prefix}{path}.js{suffix}"
        return match.group(0)

    new_content = relative_import_pattern.sub(replace_func, content)
    new_content = side_effect_import_pattern.sub(replace_func, new_content)

    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        return True
    return False

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            file_path = os.path.join(root, file)
            if fix_file(file_path):
                print(f"Fixed: {file_path}")
