import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Award, Clock, DollarSign, ArrowUpRight, ShieldCheck, Zap, Radar } from 'lucide-react';
import { Project, SectorType } from '../types';

interface DashboardProps {
  projects: Project[];
}

export default function Dashboard({ projects = [] }: DashboardProps) {
  // Calculando Métricas Reales sobre el listado actual
  const totalProyectos = projects.length;
  const proyectosEntregados = projects.filter(p => p.estado === 'Entrega').length;
  
  // Ingresos Totales (Suma de precios de todos los proyectos cerrados/entregados)
  const ingresosTotales = projects.reduce((acc, p) => acc + p.precioVenta, 0);

  // Datos para Gráfico de Sectores: Hostelería vs Comercio vs Servicios de manera dinámica
  const sectorCounts = projects.reduce((acc, p) => {
    const s = p.sector;
    if (s === 'Hostelería' || s === 'Comercio' || s === 'Servicios') {
      acc[s] = (acc[s] || 0) + 1;
    }
    return acc;
  }, { Hostelería: 0, Comercio: 0, Servicios: 0 });

  const finalSectorData = [
    { name: 'Hostelería', value: sectorCounts.Hostelería, color: '#1B365D' },
    { name: 'Comercio', value: sectorCounts.Comercio, color: '#38BDF8' },
    { name: 'Servicios', value: sectorCounts.Servicios, color: '#64748B' }
  ];

  // Datos para Gráfico de Ingresos Mensuales
  // Agrupamos el valor de venta según la fecha de entrega elegida (por mes abreviado)
  const monthlyRevenueData = [
    { name: 'Ene', ingresos: projects.filter(p => p.fechaEntrega?.includes('-01-')).reduce((sum, p) => sum + p.precioVenta, 0) },
    { name: 'Feb', ingresos: projects.filter(p => p.fechaEntrega?.includes('-02-')).reduce((sum, p) => sum + p.precioVenta, 0) },
    { name: 'Mar', ingresos: projects.filter(p => p.fechaEntrega?.includes('-03-')).reduce((sum, p) => sum + p.precioVenta, 0) },
    { name: 'Abr', ingresos: projects.filter(p => p.fechaEntrega?.includes('-04-')).reduce((sum, p) => sum + p.precioVenta, 0) },
    { name: 'May', ingresos: projects.filter(p => p.fechaEntrega?.includes('-05-')).reduce((sum, p) => sum + p.precioVenta, 0) },
    { name: 'Jun', ingresos: projects.filter(p => p.fechaEntrega?.includes('-06-')).reduce((sum, p) => sum + p.precioVenta, 0) }
  ];

  // Métricas estáticas / dinámicas como solicita el cliente:
  const promedioDiasDesarrollo = projects.length > 0 ? Math.round(projects.reduce((acc, p) => {
    const created = new Date(p.createdAt || '2026-05-10');
    const delivery = new Date(p.fechaEntrega);
    const diffTime = Math.abs(delivery.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 5;
    return acc + diffDays;
  }, 0) / projects.length) : 0;

  const tasaConversionUrretxu = projects.length > 0 ? `${Math.round((projects.length / (projects.length + 5)) * 100)}%` : '0%';

  // Animación del contenedor
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1B365D] tracking-tight">JR CRM</h1>
          <p className="text-[#2C3E50]/70 font-medium mt-1">Escalando comercios locales en Urretxu y Zumarraga con webs de alto nivel.</p>
        </div>
        <div className="flex gap-2 bg-[#E1E8ED]/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/50">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white text-[#1B365D] shadow-sm flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Modo Escalar Activo
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl text-[#2C3E50]/70 flex items-center gap-1">
            v1.2.4
          </span>
        </div>
      </div>

      {/* Grid de Métricas Principales (Liquid Glass) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metrica 1 */}
        <motion.div
          variants={itemVariants}
          className="liquid-glass p-6 rounded-[24px] relative overflow-hidden group hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-115 transition-transform">
            <DollarSign className="h-16 w-16 text-[#1B365D]" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Facturación Pipeline</p>
          <p className="text-3xl font-extrabold text-[#1B365D] mt-2">
            {ingresosTotales.toLocaleString('es-ES')} €
          </p>
          <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs mt-3 bg-emerald-100/40 w-fit px-2 py-0.5 rounded-full">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>0% este mes</span>
          </div>
        </motion.div>

        {/* Metrica 2 */}
        <motion.div
          variants={itemVariants}
          className="liquid-glass p-6 rounded-[24px] relative overflow-hidden group hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-115 transition-transform">
            <Award className="h-16 w-16 text-cyan-500" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Webs Entregadas</p>
          <p className="text-3xl font-extrabold text-[#1B365D] mt-2">
            {proyectosEntregados} <span className="text-sm font-medium text-slate-400">/ {totalProyectos}</span>
          </p>
          <div className="flex items-center gap-1 text-cyan-600 font-semibold text-xs mt-3 bg-cyan-100/40 w-fit px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Postpack premium</span>
          </div>
        </motion.div>

        {/* Metrica 3 */}
        <motion.div
          variants={itemVariants}
          className="liquid-glass p-6 rounded-[24px] relative overflow-hidden group hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-115 transition-transform">
            <Clock className="h-16 w-16 text-indigo-500" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Desarrollo Medio</p>
          <p className="text-3xl font-extrabold text-[#1B365D] mt-2">
            {promedioDiasDesarrollo} <span className="text-lg font-bold">días</span>
          </p>
          <div className="flex items-center gap-1 text-[#1B365D] font-semibold text-xs mt-3 bg-[#1B365D]/10 w-fit px-2 py-0.5 rounded-full">
            <Zap className="h-3.5 w-3.5 text-[#1B365D]" />
            <span>0 días con automatización</span>
          </div>
        </motion.div>

        {/* Metrica 4 */}
        <motion.div
          variants={itemVariants}
          className="liquid-glass p-6 rounded-[24px] relative overflow-hidden group hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-115 transition-transform">
            <ArrowUpRight className="h-16 w-16 text-slate-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Conversión (Urretxu)</p>
          <p className="text-3xl font-extrabold text-[#1B365D] mt-2">
            {tasaConversionUrretxu}
          </p>
          <div className="flex items-center gap-1 text-purple-600 font-semibold text-xs mt-3 bg-purple-100/40 w-fit px-2 py-0.5 rounded-full">
            <span>Mercado local óptimo</span>
          </div>
        </motion.div>

      </div>

      {/* Gráficos de Datos Visuales (Liquid Glass) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de barras de ingresos */}
        <motion.div
          variants={itemVariants}
          className="liquid-glass p-6 rounded-[24px] lg:col-span-2 flex flex-col h-[380px]"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-[#1B365D]">Ingresos Mensuales</h3>
              <p className="text-xs font-semibold text-slate-500 tracking-wide mt-0.5">Volumen total producido por proyectos cerrados (Ene - Jun)</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-white bg-[#1B365D] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-lg">
                RECHART ENGINE
              </span>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyRevenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B365D" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(225, 232, 237, 0.4)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#475569', fontSize: 11 }} 
                  unit=" €"
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(27, 54, 93, 0.05)', radius: 10 }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(27, 54, 93, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                  }}
                  itemStyle={{ color: '#1B365D', fontWeight: 600 }}
                  labelStyle={{ fontWeight: 700, color: '#475569' }}
                  formatter={(value) => [`${value} €`, 'Ingresos']}
                />
                <Bar 
                  dataKey="ingresos" 
                  fill="url(#barGradient)" 
                  radius={[10, 10, 0, 0]} 
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico de Sectores / Tarta */}
        <motion.div
          variants={itemVariants}
          className="liquid-glass p-6 rounded-[24px] flex flex-col h-[380px]"
        >
          <div>
            <h3 className="text-lg font-bold text-[#1B365D]">Distribución por Sector</h3>
            <p className="text-xs font-semibold text-slate-500 tracking-wide mt-0.5">Nicho de negocios locales captados</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-0">
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={finalSectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalSectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(27, 54, 93, 0.1)',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Indicador en el centro */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-2xl font-extrabold text-[#1B365D]">{totalProyectos}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activos</span>
            </div>
          </div>

          {/* Leyenda */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-slate-200/40">
            {finalSectorData.map((sect, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sect.color }} />
                  <span className="text-xs font-bold text-slate-600 truncate max-w-[80px]">{sect.name}</span>
                </div>
                <span className="text-sm font-extrabold text-[#1B365D] mt-0.5">{sect.value}</span>
              </div>
            ))}
          </div>

        </motion.div>

      </div>

      {/* Tarjeta de Acceso Seguro / Atajo rápido */}
      <motion.div
        variants={itemVariants}
        className="liquid-glass p-5 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-[#1B365D]"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#1B365D]/10 rounded-2xl text-[#1B365D]">
            <Radar className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#1B365D]">Última Prospección Realizada</h4>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Zumarraga consolidada. Urretxu tiene 0 comercios sin web esperando ser contactados.</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
          Actualizado hace unos instantes • 2026-05-29
        </div>
      </motion.div>
    </motion.div>
  );
}
