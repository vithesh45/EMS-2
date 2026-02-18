import React, { useMemo, useState, useRef } from 'react';
import { useStock } from '../../hooks/useStock';
import { useAuth } from '../../hooks/useAuth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Briefcase, Gavel, User, Download, Filter } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const NAVY = "#1a365d";
const ROYAL = "#2b6cb0";
const TODO_DARK = "#94a3b8"; // Darkened from SKY for visibility

const Dashboard = () => {
  const { state } = useStock();
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const dashboardRef = useRef(null);

  /* -------------------- DATA LOGIC -------------------- */
  const regionsList = useMemo(() => {
    const regions = [...new Set((state.workOrders || []).map(wo => wo.region).filter(Boolean))];
    return ['All Regions', ...regions];
  }, [state.workOrders]);

  const filteredWOs = useMemo(() => {
    if (selectedRegion === 'All Regions') return state.workOrders || [];
    return (state.workOrders || []).filter(wo => wo.region === selectedRegion);
  }, [state.workOrders, selectedRegion]);

  const stats = useMemo(() => {
    const totalWOs = filteredWOs.length;
    const completedWOs = filteredWOs.filter(wo => wo.status === 'Completed').length;
    const inProgressWOs = filteredWOs.filter(wo => wo.status === 'In Progress').length;
    const totalDwaAmount =
      (state.dwaEntries || []).reduce((a, c) => a + (Number(c.amount) || 0), 0) / 10000000;

    return {
      dwa: totalDwaAmount.toFixed(1),
      woCount: `${completedWOs} / ${totalWOs}`,
      completedPercent: totalWOs ? Math.round((completedWOs / totalWOs) * 100) : 0,
      inProgressPercent: totalWOs ? Math.round((inProgressWOs / totalWOs) * 100) : 0,
    };
  }, [filteredWOs, state.dwaEntries]);

  const regionStats = useMemo(() => {
    if (!state.workOrders) return [];
    const unique = [...new Set(state.workOrders.map(w => w.region).filter(Boolean))];
    return unique.map(name => {
      const r = state.workOrders.filter(w => w.region === name);
      return {
        name,
        completed: r.filter(w => w.status === 'Completed').length,
        inProgress: r.filter(w => w.status === 'In Progress').length,
        todo: r.filter(w => w.status === 'Todo' || !w.status).length,
        total: r.length
      };
    });
  }, [state.workOrders]);

  const monthlyTrends = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const year = new Date().getFullYear();

    return months.map((m, i) => {
      const match = item => {
        const d = new Date(item.createdAt || item.date);
        return d.getMonth() === i && d.getFullYear() === year;
      };
      const w = filteredWOs.filter(match);

      return {
        month: m,
        Completed: w.filter(x => x.status === 'Completed').length,
        InProgress: w.filter(x => x.status === 'In Progress').length, // Swapped Billing for In Progress
        Todo: w.filter(x => x.status === 'Todo' || !x.status).length
      };
    });
  }, [filteredWOs]);

  const pieData = regionStats.map((r, i) => ({
    name: r.name,
    value: r.total,
    color: i % 2 ? ROYAL : NAVY
  }));

  const downloadPDF = async () => {
    const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(img, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save('Dashboard.pdf');
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-700">

      {/* HEADER */}
      <div className="relative mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="absolute right-0 top-0 flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border shadow">
          <span className="font-bold text-sm">{user?.name || 'Manager'}</span>
          <User size={18} />
        </div>
      </div>

      {/* FILTER + EXPORT */}
      <div className="flex gap-3 mb-8">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border shadow">
          <Filter size={14} />
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="text-sm font-bold bg-transparent outline-none"
          >
            {regionsList.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <button onClick={downloadPDF} className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border shadow font-bold text-sm">
          <Download size={16}/> Export
        </button>
      </div>

      <div ref={dashboardRef} className="space-y-8">

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard icon={<Briefcase />} label="DWA in Cr." value={`${stats.dwa} / 10`} />
          <KPICard icon={<Gavel />} label="Work Orders" value={stats.woCount} />
          <ProgressCard label="COMPLETED %" percent={stats.completedPercent} color="bg-[#1a365d]" />
          <ProgressCard label="INPROGRESS %" percent={stats.inProgressPercent} color="bg-red-500" />
        </div>

        {/* PIE + MINI PIES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border shadow h-80">
            <h3 className="text-sm font-bold mb-3 text-slate-500 ">Region Distribution</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={90} dataKey="value">
                  {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {regionStats.map((r,i) => (
              <SectionBlock key={i} title={r.name} c={r.completed} p={r.inProgress} t={r.todo} />
            ))}
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Month Wise Status">
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <Tooltip />
              <Bar name="Completed" dataKey="Completed" fill={NAVY} />
              <Bar name="In Progress" dataKey="InProgress" fill={ROYAL} />
              <Bar name="Todo" dataKey="Todo" fill={TODO_DARK} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Statistics">
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <Tooltip />
              <Line name="Completed" dataKey="Completed" stroke={NAVY} strokeWidth={3} dot={false} />
              <Line name="In Progress" dataKey="InProgress" stroke={ROYAL} strokeWidth={2} dot={false} />
            </LineChart>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

/* -------------------- COMPONENTS -------------------- */
const KPICard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-2xl border shadow flex items-center gap-4">
    <div className="p-3 bg-slate-100 rounded-xl">{icon}</div>
    <div>
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  </div>
);

const ProgressCard = ({ label, percent, color }) => (
  <div className="bg-white p-6 rounded-2xl border shadow">
    <div className="flex justify-between mb-2">
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
      <span className="font-bold">{percent}%</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`${color} h-full`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const SectionBlock = ({ title, c, p, t }) => (
  <div className="bg-white p-4 rounded-2xl border shadow flex gap-4 items-center">
    <div className="w-12 h-12">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={[{v:c||0.1},{v:p},{v:t}]} innerRadius={14} outerRadius={22} dataKey="v">
            <Cell fill={NAVY} /><Cell fill={ROYAL} /><Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="text-[10px] font-bold">
      <p className="truncate">{title}</p>
      <p>Done {c} · Prog {p} · Todo {t}</p>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl border shadow h-80">
    <h3 className="text-sm font-bold mb-4 text-slate-500 uppercase">{title}</h3>
    <ResponsiveContainer width="100%" height="85%">
      {children}
    </ResponsiveContainer>
  </div>
);

export default Dashboard;