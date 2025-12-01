import React, { useEffect, useState } from 'react';
import { RefreshCw, Activity, Building, Plus, Users, BarChart3, Clock, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ApiService } from '../services/mockData';
import { DashboardStatsResponse } from '../types';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats && loading) return <div className="p-8 text-center text-slate-500">Carregando painel...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Erro ao carregar dados.</div>;

  return (
    <div className="font-['Poppins'] bg-[#f1f5f9] min-h-[calc(100vh-2rem)] rounded-xl flex flex-col p-6 text-[#0f172a]">
      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Activity className="text-blue-600 mr-3 w-8 h-8" />
            PAINEL GERAL NIR
          </h2>
          <div className="flex items-center mt-1">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <p className="text-sm text-green-600 font-bold">ATUALIZANDO EM TEMPO REAL</p>
          </div>
        </div>
        <button 
          onClick={fetchStats} 
          className="text-slate-400 hover:text-blue-600 transition-colors" 
          title="Atualizar"
        >
          <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="flex-grow flex flex-col gap-6 overflow-hidden">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
          <div className="bg-white p-5 rounded-xl shadow-sm flex items-center border-l-4 border-blue-500">
            <div className="p-3 bg-blue-50 rounded-lg mr-4">
              <Building className="text-3xl text-blue-600 w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Ocupação Geral</p>
              <p className="text-3xl font-bold text-slate-800">{stats.taxa_ocupacao}%</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm flex items-center border-l-4 border-green-500">
            <div className="p-3 bg-green-50 rounded-lg mr-4">
              <Plus className="text-3xl text-green-600 w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Admissões Hoje</p>
              <p className="text-3xl font-bold text-slate-800">{stats.admissoes_hoje}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm flex items-center border-l-4 border-purple-500">
            <div className="p-3 bg-purple-50 rounded-lg mr-4">
              <Users className="text-3xl text-purple-600 w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Internados</p>
              <p className="text-3xl font-bold text-slate-800">
                {Object.values(stats.leitos).reduce((acc, curr) => acc + curr.occupied, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm flex flex-col h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h3 className="font-bold text-slate-700 uppercase text-sm">Fluxo Semanal</h3>
              <BarChart3 className="text-gray-300 w-5 h-5" />
            </div>
            <div className="relative flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.grafico.labels.map((l, i) => ({ label: l, val: stats.grafico.data[i] }))}>
                  <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sectors Donuts */}
          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col h-full min-h-[300px] overflow-hidden">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h3 className="font-bold text-slate-700 uppercase text-sm">Por Setor</h3>
              <PieIcon className="text-gray-300 w-5 h-5" />
            </div>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto">
              {Object.entries(stats.leitos).map(([key, item]) => {
                 const pct = item.total > 0 ? Math.round((item.occupied / item.total) * 100) : 0;
                 const data = [{ val: item.occupied, color: item.cor }, { val: item.total - item.occupied, color: '#e2e8f0' }];
                 const label = key === 'Clinico' ? 'Clínico' : key === 'Isolamento' ? 'Isolamento' : key === 'Observacao' ? 'Observação' : 'Estabilização';
                 
                 return (
                  <div key={key} className="flex flex-col items-center justify-center p-2">
                    <div className="w-24 h-24 relative mb-2">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={data} dataKey="val" innerRadius={35} outerRadius={45} startAngle={90} endAngle={-270} stroke="none">
                              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                           </Pie>
                         </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="font-bold text-lg text-slate-800">{pct}%</span>
                          <span className="text-xs text-slate-400">{item.occupied}/{item.total}</span>
                       </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                  </div>
                 );
              })}
            </div>
          </div>
        </div>

        {/* Recent Admissions */}
        <div className="flex-shrink-0 mb-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-700 uppercase text-sm">Últimas Entradas</h3>
            <Clock className="text-gray-400 w-5 h-5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.recentes.length === 0 ? (
                <div className="col-span-4 text-center py-4 text-xs text-gray-400">Carregando dados...</div>
            ) : (
                stats.recentes.map((p, idx) => {
                    const borderColors: Record<string, string> = {
                        'clinico': 'border-blue-500', 
                        'isolamento': 'border-purple-500',
                        'observacao': 'border-orange-500', 
                        'estabilizacao': 'border-red-500'
                    };
                    const borderClass = borderColors[p.slug] || 'border-gray-300';
                    return (
                        <div key={idx} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${borderClass} flex justify-between items-start transition-transform hover:-translate-y-1`}>
                            <div className="overflow-hidden pr-2">
                                <p className="font-bold text-sm text-slate-800 truncate" title={p.nome}>{p.nome}</p>
                                <p className="text-xs text-slate-500 mt-1 truncate">{p.leito}</p>
                            </div>
                            <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded flex items-center whitespace-nowrap">
                                <Clock className="mr-1 w-3 h-3" /> {p.hora}
                            </div>
                        </div>
                    );
                })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;