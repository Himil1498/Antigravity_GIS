import React from 'react';
import { useLogo } from '../../../../../contexts/LogoContext';

const LoginHeader: React.FC = () => {
  const { logoPath } = useLogo();

  return (
    <div className="text-center">
      {/* Logo */}
      <div className="mx-auto flex items-center justify-center w-full group cursor-pointer">
        <img
          src={logoPath}
          alt="OptiConnect GIS"
          className="h-44 sm:h-52 w-auto object-contain -mt-6 -mb-5 transition-all duration-500 ease-out dark:brightness-0 dark:invert group-hover:scale-[1.08] group-hover:drop-shadow-[0_0_25px_rgba(6,182,212,0.45)] group-hover:brightness-110"
        />
      </div>

      <p className="text-[10px] font-sans font-extrabold text-gray-400 dark:text-gray-500/80 tracking-[0.4em] uppercase mb-0">
        Network Infrastructure Management
      </p>
    </div>
  );
};

export default LoginHeader;

