import { Admission, Bed, DashboardStatsResponse, MapStats, Patient, AdmissionDetailsResponse } from '../types';

// Mock Data Storage
let mockPatients: Patient[] = [
  {
    id: 'p1',
    internalId: '00129384',
    name: 'Maria Silva Oliveira',
    cpf: '123.456.789-00',
    susCard: '700000000000001',
    birthDate: '1980-05-15',
    motherName: 'Ana Silva',
    sex: 'Feminino',
    phone: '(98) 99999-9999',
    address: 'Rua das Flores, 123, Centro',
    lastDischargeDate: '2023-10-10',
    editedBy: 'Admin'
  },
  {
    id: 'p2',
    internalId: '00129385',
    name: 'João Santos Souza',
    cpf: '222.333.444-55',
    susCard: '700000000000002',
    birthDate: '1965-08-20',
    motherName: 'Maria Santos',
    sex: 'Masculino',
    phone: '(98) 98888-8888',
    address: 'Av. Principal, 500, Cohab',
    editedBy: 'Admin'
  },
  {
    id: 'p3',
    internalId: '00129386',
    name: 'Francisca Ferreira',
    cpf: '333.444.555-66',
    susCard: '700000000000003',
    birthDate: '1990-01-10',
    motherName: 'Josefa Ferreira',
    sex: 'Feminino',
    phone: '(98) 97777-7777',
    address: 'Rua 10, Qd 20, Renascença',
    editedBy: 'Dr. Plantonista'
  }
];

let mockBeds: Bed[] = [
  { id: 'b1', number: '101', title: 'Leito 101', type: 'Clínico', sector: 'Internação', status: 'Ocupado', currentAdmissionId: 'a1', currentPatientName: 'Maria Silva Oliveira' },
  { id: 'b2', number: '102', title: 'Leito 102', type: 'Clínico', sector: 'Internação', status: 'Livre' },
  { id: 'b3', number: '103', title: 'Leito 103', type: 'Clínico', sector: 'Internação', status: 'Manutenção' },
  { id: 'b4', number: '201', title: 'Leito 201', type: 'Isolamento (TB)', sector: 'Internação', status: 'Ocupado', currentAdmissionId: 'a2', currentPatientName: 'João Santos Souza' },
  { id: 'b5', number: '202', title: 'Leito 202', type: 'Isolamento (TB)', sector: 'Internação', status: 'Livre' },
  { id: 'b6', number: 'OBS-01', title: 'Leito OBS-01', type: 'Observação', sector: 'Emergência', status: 'Ocupado', currentAdmissionId: 'a3', currentPatientName: 'Francisca Ferreira' },
  { id: 'b7', number: 'OBS-02', title: 'Leito OBS-02', type: 'Observação', sector: 'Emergência', status: 'Livre' },
  { id: 'b8', number: 'EST-01', title: 'Leito EST-01', type: 'Estabilização', sector: 'Emergência', status: 'Livre' },
];

let mockAdmissions: Admission[] = [
  {
    id: 'a1',
    patientId: 'p1',
    bedId: 'b1',
    entryDate: new Date(new Date().getTime() - 86400000 * 2).toISOString(), // 2 days ago
    systemEntryDate: new Date().toISOString(),
    origin: 'UPA',
    riskLevel: 'Amarelo',
    isolation: 'Nenhum',
    diagnosis: 'Pneumonia adquirida na comunidade',
    status: 'internado',
    createdBy: 'Admin'
  },
  {
    id: 'a2',
    patientId: 'p2',
    bedId: 'b4',
    entryDate: new Date(new Date().getTime() - 86400000 * 5).toISOString(), // 5 days ago
    systemEntryDate: new Date().toISOString(),
    origin: 'Transferência',
    riskLevel: 'Vermelho',
    isolation: 'Aerossol',
    diagnosis: 'Tuberculose Pulmonar',
    status: 'internado',
    createdBy: 'Admin'
  },
  {
    id: 'a3',
    patientId: 'p3',
    bedId: 'b6',
    entryDate: new Date(new Date().getTime() - 3600000 * 4).toISOString(), // 4 hours ago
    systemEntryDate: new Date().toISOString(),
    origin: 'Demanda Espontânea',
    riskLevel: 'Verde',
    isolation: 'Nenhum',
    diagnosis: 'Cefaleia intensa a esclarecer',
    status: 'internado',
    createdBy: 'Dr. Plantonista'
  }
];

// Helper
const formatDateBR = (isoString: string) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Logic implementations matching PHP structure
export const ApiService = {
  // /nir/v1/mapa-leitos
  getMapStats: async (): Promise<MapStats> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const categories: Record<string, { total: number; occupied: number; cor: string }> = {
          'Clinico': { total: 0, occupied: 0, cor: '#1e88e5' },
          'Isolamento': { total: 0, occupied: 0, cor: '#8e24aa' },
          'Observacao': { total: 0, occupied: 0, cor: '#fb8c00' },
          'Estabilizacao': { total: 0, occupied: 0, cor: '#c62828' }
        };

        const tabela: MapStats['tabela'] = [];
        const now = new Date();

        mockBeds.forEach(bed => {
          let catKey = 'Clinico';
          let slug = 'clinico';

          if (bed.type.includes('Isolamento')) { catKey = 'Isolamento'; slug = 'isolamento'; }
          else if (bed.type.includes('Observação')) { catKey = 'Observacao'; slug = 'observacao'; }
          else if (bed.type.includes('Estabilização')) { catKey = 'Estabilizacao'; slug = 'estabilizacao'; }

          if (categories[catKey]) {
            categories[catKey].total++;
          }

          if (bed.status === 'Ocupado') {
            if (categories[catKey]) categories[catKey].occupied++;

            const admission = mockAdmissions.find(a => a.id === bed.currentAdmissionId);
            // const patient = mockPatients.find(p => p.id === admission?.patientId);
            
            let permanencia = '-';
            let entrada_fmt = '-';

            if (admission) {
              const entryDate = new Date(admission.entryDate);
              entrada_fmt = entryDate.getDate().toString().padStart(2, '0') + '/' + (entryDate.getMonth()+1).toString().padStart(2, '0') + ' ' + entryDate.getHours().toString().padStart(2, '0') + ':' + entryDate.getMinutes().toString().padStart(2, '0');
              
              const diffMs = now.getTime() - entryDate.getTime();
              const diffHrs = Math.floor(diffMs / 3600000);
              const diffDays = Math.floor(diffHrs / 24);
              
              if (diffDays > 0) {
                 const remainingHrs = diffHrs % 24;
                 permanencia = `${diffDays}d ${remainingHrs}h`;
              } else {
                 const remainingMins = Math.floor((diffMs % 3600000) / 60000);
                 permanencia = `${diffHrs}h ${remainingMins}m`;
              }
            }

            tabela.push({
              admissao_id: admission?.id || '',
              leito: `Leito ${bed.number}`,
              tipo: bed.type,
              tipo_slug: slug,
              paciente: bed.currentPatientName || 'Desconhecido',
              entrada: entrada_fmt,
              permanencia: permanencia
            });
          }
        });

        resolve({ graficos: categories, tabela });
      }, 300);
    });
  },

  // /nir/v1/stats
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    return new Promise(resolve => {
        setTimeout(async () => {
            const mapStats = await ApiService.getMapStats();
            let total = 0;
            let occupied = 0;
            
            Object.values(mapStats.graficos).forEach(c => {
                total += c.total;
                occupied += c.occupied;
            });
            
            const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
            
            // Admissions today
            const todayStr = new Date().toDateString();
            const admissionsToday = mockAdmissions.filter(a => new Date(a.entryDate).toDateString() === todayStr).length;
            
            // Weekly flow (mock)
            const labels = [];
            const data = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(`${d.getDate()}/${d.getMonth()+1}`);
                data.push(Math.floor(Math.random() * 5)); // Random mock data for flow
            }

            // Recent
            const activeAdmissions = mockAdmissions.filter(a => a.status === 'internado')
                .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
                .slice(0, 4);
            
            const recentes = activeAdmissions.map(a => {
                const b = mockBeds.find(bed => bed.id === a.bedId);
                const p = mockPatients.find(pat => pat.id === a.patientId);
                
                let slug = 'clinico';
                if (b?.type.includes('Isolamento')) slug = 'isolamento';
                else if (b?.type.includes('Observação')) slug = 'observacao';
                else if (b?.type.includes('Estabilização')) slug = 'estabilizacao';

                const d = new Date(a.entryDate);
                const hora = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');

                return {
                    nome: p?.name || 'Desconhecido',
                    leito: b ? (b.number.includes('Leito') ? b.number : `Leito ${b.number}`) : '-',
                    slug: slug,
                    hora: hora
                };
            });

            resolve({
                leitos: mapStats.graficos,
                taxa_ocupacao: occupancyRate,
                admissoes_hoje: admissionsToday,
                grafico: { labels, data },
                recentes
            });

        }, 400);
    });
  },

  // /nir/v1/get-admissao-detalhes
  getAdmissionDetails: async (admissionId: string): Promise<AdmissionDetailsResponse | { success: false }> => {
    return new Promise(resolve => {
        const adm = mockAdmissions.find(a => a.id === admissionId);
        if (!adm) { resolve({ success: false }); return; }

        const p = mockPatients.find(pat => pat.id === adm.patientId);
        const b = mockBeds.find(bed => bed.id === adm.bedId);

        if (!p || !b) { resolve({ success: false }); return; }

        resolve({
            success: true,
            admissao: {
                id: adm.id,
                data_entrada: formatDateBR(adm.entryDate),
                data_sistema: formatDateBR(adm.systemEntryDate),
                diagnostico: adm.diagnosis || 'Não informado',
                risco: adm.riskLevel || '-',
                isolamento: adm.isolation || 'Não',
                origem: adm.origin || '-',
                cadastrado_por: adm.createdBy
            },
            leito: {
                id: b.id,
                nome: `Leito ${b.number}`,
                tipo: b.type
            },
            paciente: {
                id: p.id,
                id_interno: p.internalId,
                nome: p.name,
                cpf: p.cpf,
                sus: p.susCard,
                nasc: p.birthDate, // Raw YYYY-MM-DD for input
                sexo: p.sex,
                mae: p.motherName,
                telefone: p.phone,
                endereco: p.address,
                editado_por: p.editedBy || '-'
            }
        });
    });
  },

  // /nir/v1/update-paciente
  updatePatient: async (data: any): Promise<{ success: boolean }> => {
    return new Promise(resolve => {
        const idx = mockPatients.findIndex(p => p.id === data.paciente_id);
        if (idx > -1) {
            mockPatients[idx] = {
                ...mockPatients[idx],
                name: data.nome,
                cpf: data.cpf,
                susCard: data.sus,
                birthDate: data.nasc ? `${data.nasc.substring(0,4)}-${data.nasc.substring(4,6)}-${data.nasc.substring(6,8)}` : mockPatients[idx].birthDate, // expects YYYYMMDD from logic
                sex: data.sexo,
                motherName: data.mae,
                phone: data.telefone,
                address: data.endereco,
                editedBy: 'Admin'
            };
            // Update denormalized names in beds if needed
            const activeAdm = mockAdmissions.find(a => a.patientId === data.paciente_id && a.status === 'internado');
            if (activeAdm) {
                const bedIdx = mockBeds.findIndex(b => b.id === activeAdm.bedId);
                if (bedIdx > -1) {
                    mockBeds[bedIdx].currentPatientName = data.nome;
                }
            }
            resolve({ success: true });
        } else {
            resolve({ success: false });
        }
    });
  },

  // /nir/v1/alta
  dischargePatient: async (data: { admissao_id: string; leito_id: string; paciente_id: string; tipo_alta: string; data_evento: string; detalhes_texto: string }): Promise<{ success: boolean }> => {
    return new Promise(resolve => {
        const admIdx = mockAdmissions.findIndex(a => a.id === data.admissao_id);
        const bedIdx = mockBeds.findIndex(b => b.id === data.leito_id);
        const patIdx = mockPatients.findIndex(p => p.id === data.paciente_id);

        if (admIdx > -1) {
            mockAdmissions[admIdx].status = 'alta';
            mockAdmissions[admIdx].dischargeDate = new Date().toISOString();
            mockAdmissions[admIdx].dischargeDestination = data.tipo_alta;
            mockAdmissions[admIdx].dischargeNotes = data.detalhes_texto;
        }

        if (bedIdx > -1) {
            mockBeds[bedIdx].status = 'Livre';
            mockBeds[bedIdx].currentAdmissionId = undefined;
            mockBeds[bedIdx].currentPatientName = undefined;
        }

        if (patIdx > -1) {
            mockPatients[patIdx].lastDischargeDate = new Date().toISOString();
        }

        resolve({ success: true });
    });
  }
};