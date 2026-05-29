import { NetworkFolder } from '../../types';
import { RenderMapIcon } from '../../../../components/ui/RenderMapIcon';
import { getFolderIconKey } from '../NetworkMap/MapIcons';

interface BreadcrumbsProps {
  breadcrumbs: NetworkFolder[];
  onNavigate: (folderId: number | null, folderName?: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs, onNavigate }) => {
  
  // Theme Palettes for different levels
  const THEMES = [
    { name: 'indigo', active: 'bg-indigo-500', shadow: 'rgba(79, 70, 229, 0.4)', text: 'text-indigo-600', hover: 'hover:text-indigo-800', iconColor: '#6366f1' },
    { name: 'emerald', active: 'bg-emerald-500', shadow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-600', hover: 'hover:text-emerald-800', iconColor: '#10b981' },
    { name: 'rose', active: 'bg-rose-500', shadow: 'rgba(244, 63, 94, 0.4)', text: 'text-rose-600', hover: 'hover:text-rose-800', iconColor: '#f43f5e' },
    { name: 'amber', active: 'bg-amber-500', shadow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-600', hover: 'hover:text-amber-800', iconColor: '#f59e0b' },
    { name: 'cyan', active: 'bg-cyan-500', shadow: 'rgba(6, 182, 212, 0.4)', text: 'text-cyan-600', hover: 'hover:text-cyan-800', iconColor: '#06b6d4' },
    { name: 'violet', active: 'bg-violet-500', shadow: 'rgba(139, 92, 246, 0.4)', text: 'text-violet-600', hover: 'hover:text-violet-800', iconColor: '#8b5cf6' },
    { name: 'pink', active: 'bg-pink-500', shadow: 'rgba(236, 72, 153, 0.4)', text: 'text-pink-600', hover: 'hover:text-pink-800', iconColor: '#ec4899' },
  ];

  // Helper to determine theme based on index and folder
  const getTheme = (folder: NetworkFolder | null, index: number = -1) => {
    // Root Theme (Root is -1 or folder is null)
    if (!folder || index === -1) return {
      base: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200',
      active: 'bg-blue-600',
      shadow: 'rgba(37, 99, 235, 0.4)',
      icon: 'home',
      inactiveIconColor: '#3b82f6'
    };

    const palette = THEMES[index % THEMES.length];
    const iconKey = getFolderIconKey(folder) || 'layers';

    return {
      base: `${palette.text} dark:opacity-90 hover:opacity-100 dark:hover:text-white ${palette.hover}`,
      active: palette.active,
      shadow: palette.shadow,
      icon: iconKey,
      inactiveIconColor: palette.iconColor
    };
  };

  const rootTheme = getTheme(null);

  return (
    <div 
      className="flex items-center gap-1 p-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 w-fit select-none"
      style={{
        boxShadow: `
          inset 0 2px 4px rgba(0,0,0,0.05),
          0 1px 2px rgba(0,0,0,0.05),
          0 10px 30px -10px rgba(0,0,0,0.1)
        `
      }}
    >
      {/* Root / Home Tab */}
      <button 
        onClick={() => onNavigate(null)}
        disabled={breadcrumbs.length === 0}
        className={`relative flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
          breadcrumbs.length === 0 
           ? 'text-white shadow-lg scale-105 z-10' 
           : `${rootTheme.base} hover:bg-white/50 dark:hover:bg-gray-700/50`
        }`}
      >
        <span className={`relative z-20 flex items-center gap-1.5 ${breadcrumbs.length === 0 ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]' : ''}`}>
          <RenderMapIcon 
            type={rootTheme.icon} 
            className="w-3.5 h-3.5" 
            color={breadcrumbs.length === 0 ? 'white' : rootTheme.inactiveIconColor}
          />
          Root
        </span>
        
        {/* Active 3D Background */}
        {breadcrumbs.length === 0 && (
          <>
            <div className={`absolute inset-0 rounded-full ${rootTheme.active} z-10`}
              style={{
                boxShadow: `
                  0 4px 12px ${rootTheme.shadow},
                  inset 0 1px 2px rgba(255,255,255,0.4),
                  inset 0 -2px 4px rgba(0,0,0,0.15)
                `
              }}
            />
            <div className="absolute inset-0 rounded-full z-[11] overflow-hidden"
              style={{
                background: `linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)`
              }}
            />
          </>
        )}
      </button>

      {/* Crumb Tabs */}
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const theme = getTheme(crumb, index);

        return (
          <button
            key={crumb.id}
            onClick={() => onNavigate(crumb.id, crumb.name)}
            disabled={isLast}
            className={`relative flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              isLast
                ? 'text-white shadow-lg scale-105 z-10'
                : `${theme.base} hover:bg-white/50 dark:hover:bg-gray-700/50`
            }`}
          >
            <span className={`relative z-20 flex items-center gap-1.5 ${isLast ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]' : ''}`}>
               {index === 0 && <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mr-1" />}
               <RenderMapIcon 
                type={theme.icon} 
                className="w-3.5 h-3.5" 
                color={isLast ? 'white' : theme.inactiveIconColor}
               />
               {crumb.name}
            </span>

            {/* Active 3D Background */}
            {isLast && (
              <>
                <div className={`absolute inset-0 rounded-full ${theme.active} z-10 animate-in fade-in zoom-in duration-300`}
                  style={{
                    boxShadow: `
                      0 4px 12px ${theme.shadow},
                      inset 0 1px 2px rgba(255,255,255,0.4),
                      inset 0 -2px 4px rgba(0,0,0,0.15)
                    `
                  }}
                />
                <div className="absolute inset-0 rounded-full z-[11] overflow-hidden"
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)`
                  }}
                />
              </>
            )}
            
            {/* Visual Separator Dot (Only for inactive items) */}
            {!isLast && (
              <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 opacity-50" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;

