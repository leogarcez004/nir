import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/mockData';
import { MapStats, AdmissionDetailsResponse } from '../types';
import { RefreshCw, Search as SearchIcon, Eye, X, PenTool, LogOut, Activity, BedDouble, Clock } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const BedMap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MapStats | null>(null);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null);
  const [details, setDetails] = useState<AdmissionDetailsResponse | null>(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    nome: '', cpf: '', sus: '', dia: '', mes: '', ano: '', sexo: '', mae: '', tel: '', end: '', pid: ''
  });

  // Discharge Form State
  const [dischargeType, setDischargeType] = useState('');
  const [dischargeForm, setDischargeForm] = useState({
    dia: '', mes: '', ano: '', hora: '', min: '', detalhes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await ApiService.getMapStats();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openProntuario = async (aid: string) => {
    setSelectedAdmissionId(aid);
    setActiveModal('prontuario');
    const res = await ApiService.getAdmissionDetails(aid);
    if ('success' in res && res.success) {
        setDetails(res as AdmissionDetailsResponse);
        // Pre-fill edit form
        const p = (res as AdmissionDetailsResponse).paciente;
        let dia='', mes='', ano='';
        if(p.nasc && p.nasc.length === 10) {
           [ano, mes, dia] = p.nasc.split('-');
        }
        setEditForm({
            nome: p.nome, cpf: p.cpf, sus: p.sus,
            dia, mes, ano, sexo: p.sexo, mae: p.mae, tel: p.telefone, end: p.endereco, pid: p.id
        });
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = `${editForm.ano}${editForm.mes}${editForm.dia}`; // YYYYMMDD
    await ApiService.updatePatient({
        paciente_id: editForm.pid,
        nome: editForm.nome, cpf: editForm.cpf, sus: editForm.sus,
        nasc: formattedDate, sexo: editForm.sexo, mae: editForm.mae,
        telefone: editForm.tel, endereco: editForm.end
    });
    alert('Dados atualizados com sucesso!');
    setActiveModal('prontuario');
    if (selectedAdmissionId) openProntuario(selectedAdmissionId); // Refresh details
  };

  const handleDischarge = async () => {
    if(!details) return;
    const dateStr = `${dischargeForm.dia}/${dischargeForm.mes}/${dischargeForm.ano} ${dischargeForm.hora}:${dischargeForm.min}`;
    await ApiService.dischargePatient({
        admissao_id: details.admissao.id,
        leito_id: details.leito.id,
        paciente_id: details.paciente.id,
        tipo_alta: dischargeType,
        data_evento: dateStr,
        detalhes_texto: dischargeForm.detalhes
    });
    alert('Saída registrada!');
    setActiveModal(null);
    fetchData();
  };

  // Helper for charts
  const getChartData = (occupied: number, total: number, color: string) => ({
    labels: ['Ocupados', 'Livres'],
    datasets: [{
      data: [occupied, total - occupied],
      backgroundColor: [color, '#f5f5f5'],
      borderWidth: 0,
      cutout: '75%'
    }]
  });

  const getFilteredTable = () => {
    if(!data) return [];
    return data.tabela.filter(row => 
        row.paciente.toLowerCase().includes(search.toLowerCase()) || 
        row.leito.toLowerCase().includes(search.toLowerCase()) ||
        row.tipo.toLowerCase().includes(search.toLowerCase())
    );
  };

  const days = Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const years = Array.from({length: 100}, (_, i) => (new Date().getFullYear() - i).toString());
  const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
  const mins = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));

  // Defaults for discharge form (Current date/time)
  useEffect(() => {
     if (activeModal === 'saida') {
         const now = new Date();
         setDischargeForm(prev => ({
             ...prev,
             dia: now.getDate().toString().padStart(2, '0'),
             mes: (now.getMonth()+1).toString().padStart(2, '0'),
             ano: now.getFullYear().toString(),
             hora: now.getHours().toString().padStart(2, '0'),
             min: now.getMinutes().toString().padStart(2, '0')
         }));
     }
  }, [activeModal]);

  return (
    <div className="font-['Montserrat'] bg-[#f4f6f9] p-5 min-h-[800px] rounded-lg text-[#37474f]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-[#0d2e61] font-extrabold m-0 text-2xl uppercase">Mapa de Leitos</h2>
          <span className="text-[#78909c] text-xs font-medium">Monitoramento em Tempo Real</span>
        </div>
        <button onClick={fetchData} className="bg-white border border-[#cfd8dc] px-5 py-2.5 rounded-md cursor-pointer text-[#546e7a] font-bold text-xs transition-transform hover:bg-[#eceff1] hover:-translate-y-0.5 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> ATUALIZAR DADOS
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {data && Object.entries(data.graficos).map(([key, item]) => (
           <div key={key} className="bg-white p-5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center relative border-b-4 transition-transform hover:-translate-y-1" style={{ borderColor: item.cor }}>
              <span className="text-[13px] font-extrabold text-[#546e7a] mb-4 block uppercase tracking-wide" style={{ color: item.cor }}>{key}</span>
              <div className="relative h-[140px] w-full flex justify-center">
                 <Doughnut data={getChartData(item.occupied, item.total, item.cor)} options={{ plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '75%' }} />
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold text-[#37474f]">
                    {item.occupied}<span className="text-sm text-[#b0bec5] font-semibold">/{item.total}</span>
                 </div>
              </div>
           </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[#eceff1] flex justify-between items-center bg-white">
          <div className="text-base font-bold text-[#0d2e61] flex items-center gap-2.5 uppercase">
             <BedDouble className="text-[#b0bec5] w-5 h-5" /> Pacientes Internados
          </div>
          <div className="relative w-[300px]">
             <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#90a4ae] w-4 h-4" />
             <input 
               type="text" 
               className="w-full py-3 pl-10 pr-4 border border-[#cfd8dc] rounded-lg text-[13px] bg-[#fcfcfc] transition-colors focus:border-[#1e88e5] focus:bg-white focus:outline-none"
               placeholder="Buscar paciente, leito, tipo ou ID..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>
        <div className="overflow-y-auto max-h-[500px]">
           <table className="w-full border-collapse">
              <thead>
                 <tr>
                    <th className="bg-[#f8f9fa] text-left px-6 py-4 text-[#546e7a] text-[11px] font-extrabold uppercase border-b-2 border-[#eceff1] sticky top-0 z-10 w-[35%]">Paciente / Setor</th>
                    <th className="bg-[#f8f9fa] text-left px-6 py-4 text-[#546e7a] text-[11px] font-extrabold uppercase border-b-2 border-[#eceff1] sticky top-0 z-10 w-[15%]">Leito</th>
                    <th className="bg-[#f8f9fa] text-left px-6 py-4 text-[#546e7a] text-[11px] font-extrabold uppercase border-b-2 border-[#eceff1] sticky top-0 z-10 w-[20%]">Data Entrada</th>
                    <th className="bg-[#f8f9fa] text-left px-6 py-4 text-[#546e7a] text-[11px] font-extrabold uppercase border-b-2 border-[#eceff1] sticky top-0 z-10 w-[20%]">Permanência</th>
                    <th className="bg-[#f8f9fa] text-left px-6 py-4 text-[#546e7a] text-[11px] font-extrabold uppercase border-b-2 border-[#eceff1] sticky top-0 z-10 w-[10%]">Ação</th>
                 </tr>
              </thead>
              <tbody>
                 {loading ? (
                    <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-500">Carregando dados...</td></tr>
                 ) : getFilteredTable().length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-500">Nenhum paciente encontrado.</td></tr>
                 ) : (
                    getFilteredTable().map((row, idx) => {
                       const badgeColor = row.tipo_slug === 'clinico' ? 'bg-[#1e88e5]' : row.tipo_slug === 'isolamento' ? 'bg-[#8e24aa]' : row.tipo_slug === 'observacao' ? 'bg-[#fb8c00]' : row.tipo_slug === 'estabilizacao' ? 'bg-[#c62828]' : 'bg-[#78909c]';
                       return (
                          <tr key={idx} className="hover:bg-[#f1f8ff] border-b border-[#f0f0f0]">
                             <td className="px-6 py-4 text-[13px] text-[#455a64] align-middle">
                                <span className="font-bold text-[#263238] block text-sm mb-1">{row.paciente}</span>
                                <span className="text-[11px] text-[#78909c] font-semibold uppercase">{row.tipo}</span>
                             </td>
                             <td className="px-6 py-4 text-[13px] text-[#455a64] align-middle">
                                <span className={`px-3 py-1.5 rounded-md font-bold text-[11px] text-white min-w-[90px] text-center inline-block shadow-sm ${badgeColor}`}>{row.leito}</span>
                             </td>
                             <td className="px-6 py-4 text-[13px] text-[#455a64] align-middle">{row.entrada}</td>
                             <td className="px-6 py-4 text-[13px] text-[#455a64] align-middle">
                                <div className="font-bold text-[#e65100] flex items-center gap-1.5 bg-[#fff3e0] px-3 py-1.5 rounded-full w-fit text-[11px]">
                                   <Clock className="w-3 h-3" /> {row.permanencia}
                                </div>
                             </td>
                             <td className="px-6 py-4 text-[13px] text-[#455a64] align-middle">
                                <button onClick={() => openProntuario(row.admissao_id)} className="bg-[#0d2e61] text-white border-none px-4 py-2 rounded-md cursor-pointer text-[11px] font-bold uppercase transition-transform hover:bg-[#1565c0] hover:-translate-y-0.5 shadow-sm flex items-center gap-1.5">
                                   <Eye className="w-3 h-3" /> VER
                                </button>
                             </td>
                          </tr>
                       );
                    })
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* Modal Backdrop */}
      {activeModal && (
        <div className="fixed inset-0 bg-[#0d2e61]/90 z-[99999] flex justify-center items-center backdrop-blur-sm animate-fade-in">
          
          {/* Modal Prontuário */}
          {activeModal === 'prontuario' && details && (
             <div className="bg-white w-[95%] max-w-[750px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                <div className="bg-[#0d2e61] text-white px-8 py-5 flex justify-between items-center shrink-0">
                   <span className="text-lg font-extrabold uppercase tracking-wide flex items-center gap-2"><Activity className="w-5 h-5" /> Prontuário Digital</span>
                   <X className="cursor-pointer opacity-80 hover:opacity-100 hover:rotate-90 transition-all w-6 h-6" onClick={() => setActiveModal(null)} />
                </div>
                <div className="p-8 overflow-y-auto flex-1">
                   <div className="flex gap-5 mb-5 bg-[#f8f9fa] p-6 rounded-xl border-l-[6px] border-[#0d2e61]">
                      <div className="flex-1">
                         <span className="text-[11px] font-extrabold text-[#78909c] uppercase block mb-1.5">Nome Completo</span>
                         <div className="text-[15px] font-bold text-[#37474f]">{details.paciente.nome}</div>
                         <div className="mt-4"><span className="text-[11px] font-extrabold text-[#78909c] uppercase block mb-1.5">Cartão SUS</span><span className="text-[15px] font-bold text-[#37474f]">{details.paciente.sus}</span></div>
                      </div>
                      <div className="flex-1">
                         <span className="text-[11px] font-extrabold text-[#78909c] uppercase block mb-1.5">Data de Nascimento</span>
                         <div className="text-[15px] font-bold text-[#37474f]">{details.paciente.nasc}</div>
                         <div className="mt-4"><span className="text-[11px] font-extrabold text-[#78909c] uppercase block mb-1.5">CPF</span><span className="text-[15px] font-bold text-[#37474f]">{details.paciente.cpf}</span></div>
                      </div>
                      <div className="flex-1">
                         <span className="text-[11px] font-extrabold text-[#78909c] uppercase block mb-1.5">ID Interno</span>
                         <div className="text-[15px] font-bold text-[#37474f]">{details.paciente.id_interno}</div>
                         <div className="mt-4"><span className="text-[11px] font-extrabold text-[#78909c] uppercase block mb-1.5">Sexo</span><span className="text-[15px] font-bold text-[#37474f]">{details.paciente.sexo}</span></div>
                      </div>
                   </div>
                   
                   <button onClick={() => setActiveModal('editar')} className="bg-[#ffa000] text-white w-full py-3.5 rounded-lg font-bold text-[13px] uppercase cursor-pointer transition-transform hover:bg-[#ff8f00] hover:-translate-y-0.5 flex items-center justify-center gap-2 mb-5">
                      <PenTool className="w-4 h-4" /> EDITAR DADOS DO PACIENTE
                   </button>

                   <div className="mb-2 mt-2"><span className="text-xs font-bold text-[#546e7a] uppercase border-b border-[#eee] pb-1 block">Dados da Internação Atual</span></div>
                   <div className="grid grid-cols-2 gap-4 text-[13px] text-[#455a64] bg-white border border-[#e0e0e0] p-5 rounded-lg">
                      <div><strong className="text-[#0d2e61] font-bold mr-1">Nº Admissão:</strong> {details.admissao.id}</div>
                      <div><strong className="text-[#0d2e61] font-bold mr-1">Leito Atual:</strong> {details.leito.nome}</div>
                      <div><strong className="text-[#0d2e61] font-bold mr-1">Admissão em:</strong> {details.admissao.data_entrada}</div>
                      <div><strong className="text-[#0d2e61] font-bold mr-1">Cadastrado em:</strong> {details.admissao.data_sistema}</div>
                      <div><strong className="text-[#0d2e61] font-bold mr-1">Class. Risco:</strong> {details.admissao.risco}</div>
                      <div><strong className="text-[#0d2e61] font-bold mr-1">Isolamento:</strong> {details.admissao.isolamento}</div>
                      <div className="col-span-2"><strong className="text-[#0d2e61] font-bold mr-1">Diagnóstico:</strong> {details.admissao.diagnostico}</div>
                      <div><strong className="text-[#0d2e61] font-bold mr-1">Origem:</strong> {details.admissao.origem}</div>
                      <div><strong className="text-[#0d2e61] font-bold mr-1">Criado por:</strong> {details.admissao.cadastrado_por}</div>
                      <div><strong className="text-[#0d2e61] font-bold mr-1">Editado por:</strong> {details.paciente.editado_por}</div>
                   </div>

                   <button onClick={() => setActiveModal('status')} className="bg-[#1565c0] text-white w-full py-4 rounded-lg font-extrabold text-sm uppercase cursor-pointer mt-5 shadow-lg transition-transform hover:bg-[#0d47a1] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" /> GERENCIAR STATUS / REGISTRAR ALTA
                   </button>
                </div>
             </div>
          )}

          {/* Modal Editar */}
          {activeModal === 'editar' && (
             <div className="bg-white w-[95%] max-w-[750px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                <div className="bg-[#0d2e61] text-white px-8 py-5 flex items-center shrink-0">
                   <span className="text-lg font-extrabold uppercase tracking-wide flex items-center gap-2"><PenTool className="w-5 h-5" /> Editar Paciente</span>
                </div>
                <div className="p-8 overflow-y-auto flex-1">
                   <form onSubmit={handleEditSave}>
                      <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">Nome Completo</label>
                      <input type="text" className="w-full p-3.5 border border-[#cfd8dc] rounded-lg mb-5 text-sm font-medium focus:border-[#1e88e5] focus:outline-none" required value={editForm.nome} onChange={e => setEditForm({...editForm, nome: e.target.value})} />
                      
                      <div className="flex gap-5 mb-5">
                         <div className="flex-1">
                            <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">CPF</label>
                            <input type="text" className="w-full p-3.5 border border-[#cfd8dc] rounded-lg text-sm font-medium focus:border-[#1e88e5] focus:outline-none" value={editForm.cpf} onChange={e => setEditForm({...editForm, cpf: e.target.value})} />
                         </div>
                         <div className="flex-1">
                            <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">Cartão SUS</label>
                            <input type="text" className="w-full p-3.5 border border-[#cfd8dc] rounded-lg text-sm font-medium focus:border-[#1e88e5] focus:outline-none" value={editForm.sus} onChange={e => setEditForm({...editForm, sus: e.target.value})} />
                         </div>
                      </div>

                      <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">Data de Nascimento</label>
                      <div className="flex gap-2.5 mb-5">
                         <select className="flex-1 p-3.5 border border-[#cfd8dc] rounded-lg text-sm bg-white" value={editForm.dia} onChange={e => setEditForm({...editForm, dia: e.target.value})}>
                            <option value="">Dia</option>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                         <select className="flex-1 p-3.5 border border-[#cfd8dc] rounded-lg text-sm bg-white" value={editForm.mes} onChange={e => setEditForm({...editForm, mes: e.target.value})}>
                            <option value="">Mês</option>
                            {months.map((m, i) => <option key={i} value={(i+1).toString().padStart(2, '0')}>{m}</option>)}
                         </select>
                         <select className="flex-1 p-3.5 border border-[#cfd8dc] rounded-lg text-sm bg-white" value={editForm.ano} onChange={e => setEditForm({...editForm, ano: e.target.value})}>
                            <option value="">Ano</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                         </select>
                      </div>

                      <div className="flex gap-5 mb-5">
                         <div className="flex-1">
                            <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">Sexo</label>
                            <select className="w-full p-3.5 border border-[#cfd8dc] rounded-lg text-sm font-medium bg-white" value={editForm.sexo} onChange={e => setEditForm({...editForm, sexo: e.target.value})}>
                               <option value="Masculino">Masculino</option>
                               <option value="Feminino">Feminino</option>
                            </select>
                         </div>
                         <div className="flex-1">
                            <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">Telefone</label>
                            <input type="text" className="w-full p-3.5 border border-[#cfd8dc] rounded-lg text-sm font-medium focus:border-[#1e88e5] focus:outline-none" value={editForm.tel} onChange={e => setEditForm({...editForm, tel: e.target.value})} />
                         </div>
                      </div>
                      
                      <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">Nome da Mãe</label>
                      <input type="text" className="w-full p-3.5 border border-[#cfd8dc] rounded-lg mb-5 text-sm font-medium focus:border-[#1e88e5] focus:outline-none" value={editForm.mae} onChange={e => setEditForm({...editForm, mae: e.target.value})} />

                      <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">Endereço</label>
                      <input type="text" className="w-full p-3.5 border border-[#cfd8dc] rounded-lg mb-5 text-sm font-medium focus:border-[#1e88e5] focus:outline-none" placeholder="Rua, Número, Bairro, Cidade - UF" value={editForm.end} onChange={e => setEditForm({...editForm, end: e.target.value})} />

                      <div className="flex gap-4 mt-2.5">
                         <button type="button" onClick={() => setActiveModal('prontuario')} className="bg-[#eceff1] text-[#546e7a] w-full py-4 rounded-lg font-bold text-sm uppercase cursor-pointer transition hover:bg-[#cfd8dc]">CANCELAR</button>
                         <button type="submit" className="bg-[#2e7d32] text-white w-full py-4 rounded-lg font-extrabold text-sm uppercase cursor-pointer transition hover:bg-[#1b5e20]">SALVAR ALTERAÇÕES</button>
                      </div>
                   </form>
                </div>
             </div>
          )}

          {/* Modal Status */}
          {activeModal === 'status' && (
             <div className="bg-white w-[95%] max-w-[550px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                <div className="bg-[#0d2e61] text-white px-8 py-5 flex items-center shrink-0">
                   <span className="text-lg font-extrabold uppercase tracking-wide">Alterar Situação do Leito</span>
                </div>
                <div className="p-8">
                   <p className="text-center text-[#546e7a] mb-6 font-semibold">Selecione o motivo para liberar o leito:</p>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => { setDischargeType('Alta'); setActiveModal('saida'); }} className="border-none py-6 px-4 rounded-xl font-extrabold cursor-pointer text-white text-[13px] uppercase shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg bg-[#43a047] flex flex-col items-center gap-2"><LogOut /> ALTA MÉDICA</button>
                      <button onClick={() => { setDischargeType('Obito'); setActiveModal('saida'); }} className="border-none py-6 px-4 rounded-xl font-extrabold cursor-pointer text-white text-[13px] uppercase shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg bg-[#e53935] flex flex-col items-center gap-2"><Activity /> ÓBITO</button>
                      <button onClick={() => { setDischargeType('Evasao'); setActiveModal('saida'); }} className="border-none py-6 px-4 rounded-xl font-extrabold cursor-pointer text-white text-[13px] uppercase shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg bg-[#fb8c00] flex flex-col items-center gap-2"><Activity /> EVASÃO</button>
                      <button onClick={() => { setDischargeType('Transferido'); setActiveModal('saida'); }} className="border-none py-6 px-4 rounded-xl font-extrabold cursor-pointer text-white text-[13px] uppercase shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg bg-[#1e88e5] flex flex-col items-center gap-2"><Activity /> TRANSFERÊNCIA</button>
                      <button onClick={() => setActiveModal('prontuario')} className="col-span-2 border-none py-4 rounded-xl font-bold cursor-pointer text-white text-[13px] uppercase shadow-md transition bg-[#78909c] hover:bg-[#607d8b]">CANCELAR E VOLTAR</button>
                   </div>
                </div>
             </div>
          )}

          {/* Modal Saída */}
          {activeModal === 'saida' && (
             <div className="bg-white w-[95%] max-w-[750px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                <div className="bg-[#0d2e61] text-white px-8 py-5 flex items-center shrink-0">
                   <span className="text-lg font-extrabold uppercase tracking-wide">
                      {dischargeType === 'Alta' ? 'ALTA MÉDICA' : dischargeType === 'Obito' ? 'ÓBITO' : dischargeType === 'Evasao' ? 'EVASÃO' : 'TRANSFERÊNCIA'}
                   </span>
                </div>
                <div className="p-8">
                    <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">Data do Evento</label>
                    <div className="flex gap-2.5 mb-5">
                         <select className="flex-1 p-3.5 border border-[#cfd8dc] rounded-lg text-sm bg-white" value={dischargeForm.dia} onChange={e => setDischargeForm({...dischargeForm, dia: e.target.value})}>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                         <select className="flex-1 p-3.5 border border-[#cfd8dc] rounded-lg text-sm bg-white" value={dischargeForm.mes} onChange={e => setDischargeForm({...dischargeForm, mes: e.target.value})}>
                            {months.map((m, i) => <option key={i} value={(i+1).toString().padStart(2, '0')}>{m}</option>)}
                         </select>
                         <select className="flex-1 p-3.5 border border-[#cfd8dc] rounded-lg text-sm bg-white" value={dischargeForm.ano} onChange={e => setDischargeForm({...dischargeForm, ano: e.target.value})}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                         </select>
                    </div>

                    <div className="flex gap-2.5 items-center mb-6">
                        <label className="text-xs font-bold text-[#546e7a] uppercase">HORA:</label>
                        <select className="p-2 border border-[#cfd8dc] rounded-lg text-sm bg-white" value={dischargeForm.hora} onChange={e => setDischargeForm({...dischargeForm, hora: e.target.value})}>
                             {hours.map(h => <option key={h} value={h}>{h}h</option>)}
                        </select>
                        <span>:</span>
                        <select className="p-2 border border-[#cfd8dc] rounded-lg text-sm bg-white" value={dischargeForm.min} onChange={e => setDischargeForm({...dischargeForm, min: e.target.value})}>
                             {mins.map(m => <option key={m} value={m}>{m}m</option>)}
                        </select>
                    </div>

                    <label className="text-xs font-bold text-[#546e7a] mb-2 block uppercase">Observações / Detalhes</label>
                    <textarea 
                        className="w-full p-3.5 border border-[#cfd8dc] rounded-lg mb-5 text-sm font-medium focus:border-[#1e88e5] focus:outline-none" 
                        rows={4} 
                        placeholder="Descreva detalhes clínicos, destino ou motivo..."
                        value={dischargeForm.detalhes}
                        onChange={e => setDischargeForm({...dischargeForm, detalhes: e.target.value})}
                    />

                    <div className="flex gap-4">
                         <button type="button" onClick={() => setActiveModal('status')} className="bg-[#eceff1] text-[#546e7a] w-full py-4 rounded-lg font-bold text-sm uppercase cursor-pointer transition hover:bg-[#cfd8dc]">VOLTAR</button>
                         <button type="button" onClick={handleDischarge} className="bg-[#2e7d32] text-white w-full py-4 rounded-lg font-extrabold text-sm uppercase cursor-pointer transition hover:bg-[#1b5e20]">CONFIRMAR SAÍDA</button>
                    </div>
                </div>
             </div>
          )}

        </div>
      )}
    </div>
  );
};

export default BedMap;