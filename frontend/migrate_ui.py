import os
import re

FILE_PATH = r"c:\Optimal_Telemedia_Main\OptiConnect_GIS\frontend\src\features\users\components\UserPermissionsDialog\UserPermissionsDialogContent.tsx"

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Dictionary of Tailwind replacements to Vanilla CSS Semantic Classes
replacements = {
    # Layout & Flex
    r'className="flex items-center justify-center py-12"': r'className="ds-flex-center-py12"',
    r'className="flex items-center justify-between mb-2"': r'className="ds-flex-between-mb2"',
    r'className="flex items-center gap-2 mb-1"': r'className="ds-flex-gap2-mb1"',
    r'className="grid grid-cols-1 md:grid-cols-2 gap-3"': r'className="ds-grid-2col-gap3"',
    r'className="grid grid-cols-1 lg:grid-cols-2 gap-8"': r'className="ds-grid-lg2col-gap8"',
    r'className="space-y-4"': r'className="ds-space-y-4"',
    r'className="space-y-6"': r'className="ds-space-y-6"',
    r'className="space-y-3 p-4 bg-amber-50/20 dark:bg-amber-900/5 rounded-xl border border-amber-100/50 dark:border-amber-900/20"': r'className="ds-group-card-amber"',
    r'className="space-y-3 p-4 bg-blue-50/20 dark:bg-blue-900/5 rounded-xl border border-blue-100/50 dark:border-blue-900/20"': r'className="ds-group-card-blue"',
    
    # Typography
    r'className="text-xs font-bold text-gray-500 uppercase tracking-wider"': r'className="ds-text-heading-sm"',
    r'className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 mb-4"': r'className="ds-text-heading-md"',
    r'className="text-\[10px\] text-gray-400 italic"': r'className="ds-text-empty-italic"',
    
    # Misc Modifiers
    r'className="mt-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3 ml-2"': r'className="ds-folder-section"',
    r'className="mt-3 border-l-2 border-indigo-200 dark:border-indigo-700 pl-3 ml-2"': r'className="ds-folder-add-section"',
    r'className="ml-6 border-l-2 border-indigo-100 dark:border-indigo-900/30 pl-4 mt-2 mb-3 space-y-2"': r'className="ds-sub-items-indigo"',
    r'className="ml-6 border-l-2 border-amber-100 dark:border-amber-900/30 pl-4 mt-2 space-y-2"': r'className="ds-sub-items-amber"',
    r'className="ml-6 border-l-2 border-blue-100 dark:border-blue-900/30 pl-4 mt-2 space-y-2"': r'className="ds-sub-items-blue"',
    r'className="ml-6 border-l-2 border-red-100 dark:border-red-900/30 pl-4 mt-2 space-y-2"': r'className="ds-sub-items-red"',
}

for old, new_class in replacements.items():
    content = re.sub(old, new_class, content)

# Write back
with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("Migration script executed.")
