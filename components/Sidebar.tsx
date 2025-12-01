import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HeartPulse, 
  PieChart, 
  Bed, 
  Users, 
  PlusCircle, 
  LogOut,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[260px] bg-[#0d2e61] text-white flex flex-col shadow-[4px_0_15px_rgba(0,0,0,0.1)] z-[9999] overflow-y-auto font-['Montserrat'] py-6 px-5">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 pb-5 border-b border-white/10">
        <HeartPulse className="w-7 h-7 text-white" />
        <div>
          <h2 className="text-lg font-bold leading-tight m-0 text-white">NIR</h2>
          <span className="text-xs font-normal opacity-70 block">Hosp. Coroadinho</span>
        </div>
      </div>

      {/* Primary Action */}
      <NavLink 
        to="/admission"
        className="flex items-center justify-center gap-2.5 bg-[#2e7d32] text-white no-underline p-4 rounded-lg font-bold text-sm uppercase mb-8 shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition-all duration-300 border border-[#388e3c] hover:bg-[#1b5e20] hover:-translate-y-0.5"
      >
        <PlusCircle className="w-4 h-4" />
        Nova Admissão
      </NavLink>

      {/* Navigation */}
      <nav className="flex flex-col gap-2.5 flex-1">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => 
            `flex items-center gap-4 px-5 py-3.5 rounded-lg text-sm transition-all duration-200 ${
              isActive 
              ? 'bg-[#1565c0] text-white font-bold shadow-[0_2px_8px_rgba(0,0,0,0.2)]' 
              : 'text-white/70 font-medium hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <PieChart className="w-4 h-4" />
          Painel Geral
        </NavLink>
        
        <NavLink 
          to="/beds" 
          className={({ isActive }) => 
            `flex items-center gap-4 px-5 py-3.5 rounded-lg text-sm transition-all duration-200 ${
              isActive 
              ? 'bg-[#1565c0] text-white font-bold shadow-[0_2px_8px_rgba(0,0,0,0.2)]' 
              : 'text-white/70 font-medium hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <Bed className="w-4 h-4" />
          Painel de Leitos
        </NavLink>
        
        <NavLink 
          to="/patients" 
          className={({ isActive }) => 
            `flex items-center gap-4 px-5 py-3.5 rounded-lg text-sm transition-all duration-200 ${
              isActive 
              ? 'bg-[#1565c0] text-white font-bold shadow-[0_2px_8px_rgba(0,0,0,0.2)]' 
              : 'text-white/70 font-medium hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <Users className="w-4 h-4" />
          Banco de Pacientes
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="pt-5 border-t border-white/10 flex items-center gap-3 mt-auto">
        <div className="w-10 h-10 rounded-full bg-white border-2 border-white overflow-hidden flex items-center justify-center">
             <Users className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex-1 overflow-hidden">
          <span className="text-sm font-bold text-white block whitespace-nowrap overflow-hidden text-ellipsis leading-tight">Admin User</span>
          <span className="text-[11px] opacity-70 text-[#cfd8dc] block mt-0.5">Conectado</span>
        </div>
        <button className="text-[#ef5350] text-sm p-1.5 transition-colors hover:text-[#ffcdd2]" title="Sair">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;