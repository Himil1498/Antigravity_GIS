const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../src');

const filesToFix = [
  'components/NavigationBar/ProfileDropdown/TemporaryAccessSection.tsx',
  'components/NavigationBar/ProfileDropdown/types.ts',
  'components/user/RegionAccessRequestForm/types.ts',
  'components/user/RegionAccessRequestForm/useRegionAccessRequest.ts',
  'features/admin/AuditLogViewer.tsx',
  'features/admin/AuditLogViewer/components/LogDetailsInfoGrid.tsx',
  'features/admin/AuditLogViewer/components/LogDetailsModal.tsx',
  'features/admin/AuditLogViewer/components/LogDetailsModalBody.tsx',
  'features/admin/AuditLogViewer/components/LogDetailsStatusBanner.tsx',
  'features/admin/AuditLogViewer/components/LogDetailsUserInfo.tsx',
  'features/admin/AuditLogViewer/components/LogsTable.tsx',
  'features/admin/AuditLogViewer/hooks/useAuditLogs.ts',
  'features/admin/AuditLogViewer/utils.ts',
  'features/admin/RegionRequestManagement/types.ts',
  'features/admin/TemporaryAccessManagement/types.ts',
  'features/admin/TemporaryAccessManagement/useTemporaryAccessActions.ts',
  'features/admin/TemporaryAccessManagement/useTemporaryAccessData.ts',
  'features/map/tools/InfrastructureManagementTool/components/InfrastructureTable.tsx',
  'features/map/tools/InfrastructureManagementTool/components/InfrastructureToolboxContent.tsx',
  'features/map/tools/InfrastructureManagementTool/components/InfrastructureToolboxExpanded.tsx',
  'services/bookmark/types.ts',
  'services/regionHierarchy/types.ts',
  'services/regionRequest/crudOperations.ts',
  'services/regionRequest/queryUtils.ts',
  'services/regionRequest/requestActions.ts',
  'services/search/types.ts',
  'services/temporaryAccess/types.ts'
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Replace .ts extension in imports using regex
    // Matches: from '... .ts' or from "... .ts"
    // Also takes care of import type ... from ...
    content = content.replace(/(from\s+['"][^'"]+)\.ts(['"])/g, '$1$2');

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }
  } else {
    console.error(`File not found: ${fullPath}`);
  }
});
