import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer } from '@/components/ui/chart';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Leaf, Zap, Wind, Euro, Activity,
  CheckCircle2, Target, Printer,
} from 'lucide-react';
import { useLampPosts } from '@/context/LampContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { INTERVENTIONS } from '@/data/interventions';
import { DONNEES_ENERGETIQUES } from '@/data/energetique';
import { calcAnnualKwh, calcBaselineKwh } from '@/utils/energy';

const ANNEES = ['2021', '2022', '2023', '2024', '2025'];

const fmtEur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

interface KpiProps { label: string; value: string; sub?: string; accent?: string }
const Kpi = ({ label, value, sub, accent = 'text-foreground' }: KpiProps) => (
  <div className="rounded-xl border bg-white dark:bg-slate-900 px-5 py-4 text-center shadow-sm print:shadow-none print:border-gray-200">
    <p className={`text-3xl font-bold ${accent}`}>{value}</p>
    <p className="text-sm font-medium mt-1">{label}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

export const Rapport = () => {
  const { lampPosts } = useLampPosts();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { hoursPerNight, ledPower, classicPower, co2Factor, kwhPrice } = settings;
  const reportRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState('2025');

  // --- Stats parc ---
  const led     = lampPosts.filter((l) => l.status === 'led').length;
  const classic = lampPosts.filter((l) => l.status === 'classic').length;
  const out     = lampPosts.filter((l) => l.status === 'out').length;
  const total   = lampPosts.length;
  const ledRate = total > 0 ? (led / total) * 100 : 0;
  const operationalRate = total > 0 ? ((total - out) / total) * 100 : 0;
  const healthScore = Math.round(ledRate * 0.6 + operationalRate * 0.4);

  // --- Énergie ---
  const annualKwh  = calcAnnualKwh(led, classic, ledPower, classicPower, hoursPerNight);
  const baselineKwh = calcBaselineKwh(total, classicPower, hoursPerNight);
  const savedKwh   = baselineKwh - annualKwh;
  const savedEur   = savedKwh * kwhPrice;
  const savedCo2   = savedKwh * co2Factor;
  const coutEnergie = annualKwh * kwhPrice;

  // --- Interventions de l'année ---
  const interventionsYear = useMemo(
    () => INTERVENTIONS.filter((i) => i.date.startsWith(selectedYear)),
    [selectedYear]
  );
  const coutMaintYear = interventionsYear.reduce((s, i) => s + i.cost, 0);

  // --- Données énergetiques de l'année ---
  const donneesAnnee = DONNEES_ENERGETIQUES.find((d) => String(d.annee) === selectedYear);

  // --- Charts ---
  const pieData = [
    { name: 'LED', value: led, fill: '#16a34a' },
    { name: 'Classique', value: classic, fill: '#ca8a04' },
    { name: 'Hors service', value: out, fill: '#dc2626' },
  ];

  const barData = ANNEES.map((y) => ({
    year: y,
    maintenance: INTERVENTIONS.filter((i) => i.date.startsWith(y)).reduce((s, i) => s + i.cost, 0),
  }));

  const scoreColor =
    healthScore >= 80 ? 'text-emerald-600' : healthScore >= 60 ? 'text-amber-500' : 'text-rose-600';

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Barre d'actions (hors impression) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Rapport annuel</h1>
          <p className="text-muted-foreground mt-1">
            Synthèse consolidée à destination du Conseil municipal.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {ANNEES.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="outline" className="gap-1.5" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimer / PDF
          </Button>
        </div>
      </div>

      {/* ═══════════════════ RAPPORT ═══════════════════ */}
      <div ref={reportRef} className="space-y-8 print:space-y-6">

        {/* En-tête rapport */}
        <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 px-8 py-6 print:bg-white print:border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow print:shadow-none shrink-0">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Commune de</p>
                <h2 className="text-2xl font-bold">{user?.mairieName ?? 'Mairie'}</h2>
                <p className="text-sm text-muted-foreground">Éclairage public — Rapport annuel {selectedYear}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className={`text-5xl font-black ${scoreColor}`}>{healthScore}<span className="text-lg font-normal text-muted-foreground">/100</span></div>
              <p className="text-sm font-medium">Score vert global</p>
              <p className="text-xs text-muted-foreground">LED + disponibilité réseau</p>
            </div>
          </div>
        </div>

        {/* Indicateurs clés */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Indicateurs clés {selectedYear}</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Lampadaires LED"     value={String(led)}              sub={`${ledRate.toFixed(0)}% du parc`} accent="text-emerald-600" />
            <Kpi label="Disponibilité réseau" value={`${operationalRate.toFixed(0)} %`} sub={`${out} HS sur ${total}`}         accent="text-blue-600"    />
            <Kpi label="Coût maintenance"    value={fmtEur(coutMaintYear)}   sub={`${interventionsYear.length} interventions`} />
            <Kpi label="Coût énergie estimé" value={fmtEur(donneesAnnee?.coutEnergie ?? Math.round(coutEnergie))} sub="Parc actuel" />
          </div>
        </div>

        {/* Transition LED & Énergie */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-sm print:shadow-none print:border print:border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-emerald-600" />
                Transition LED
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChartContainer config={{}} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} innerRadius={35}
                      label={(e: { name: string; value: number }) => `${e.name}: ${e.value}`}
                      labelLine={false} dataKey="value"
                    >
                      {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v, 'Lampadaires']} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />LED installées</span>
                  <span className="font-semibold">{led} ({ledRate.toFixed(0)} %)</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" />Classiques restants</span>
                  <span className="font-semibold">{classic}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm print:shadow-none print:border print:border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wind className="h-4 w-4 text-teal-600" />
                Bilan énergétique & CO₂
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2.5">
                {[
                  { label: 'Conso. actuelle / an', value: `${fmt(donneesAnnee?.consommationKwh ?? Math.round(annualKwh))} kWh`, accent: 'text-blue-700 dark:text-blue-400' },
                  { label: 'Économies vs 100% classique', value: `${fmt(donneesAnnee?.economiesKwh ?? Math.round(savedKwh))} kWh`, accent: 'text-emerald-700 dark:text-emerald-400' },
                  { label: 'Gain financier énergie', value: fmtEur(donneesAnnee?.economiesKwh ? donneesAnnee.economiesKwh * kwhPrice : savedEur), accent: 'text-emerald-700 dark:text-emerald-400' },
                  { label: 'CO₂ évité / an', value: `${fmt(donneesAnnee?.co2Evite ?? Math.round(savedCo2))} kg`, accent: 'text-teal-700 dark:text-teal-400' },
                  { label: 'CO₂ émis / an', value: `${fmt(donneesAnnee?.co2Emis ?? Math.round(annualKwh * co2Factor))} kg`, accent: '' },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="flex justify-between text-sm border-b border-muted/50 pb-2 last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-semibold ${accent}`}>{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dépenses de maintenance */}
        <Card className="border-0 shadow-sm print:shadow-none print:border print:border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Euro className="h-4 w-4 text-blue-600" />
              Évolution des coûts de maintenance (2021 – 2025)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} tick={{ fontSize: 11 }} width={44} />
                  <Tooltip formatter={(v: number) => [fmtEur(v), 'Dépenses']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="maintenance" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {barData.map((e) => (
                      <Cell key={e.year} fill={e.year === selectedYear ? '#1d4ed8' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Objectifs & perspectives */}
        <Card className="border-0 shadow-sm print:shadow-none print:border print:border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-purple-600" />
              Objectifs & perspectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              {[
                {
                  icon: CheckCircle2,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                  title: `Taux LED : ${ledRate.toFixed(0)} %`,
                  desc: `Objectif 90 % d'ici 2026 — ${Math.max(0, Math.ceil(total * 0.9 - led))} lampadaires restants`,
                },
                {
                  icon: Zap,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50 dark:bg-blue-950/30',
                  title: `Disponibilité : ${operationalRate.toFixed(0)} %`,
                  desc: `${out} lampadaire${out > 1 ? 's' : ''} hors service à traiter`,
                },
                {
                  icon: Wind,
                  color: 'text-teal-600',
                  bg: 'bg-teal-50 dark:bg-teal-950/30',
                  title: `Score vert : ${healthScore}/100`,
                  desc: healthScore >= 80 ? 'Excellent — maintenir le cap.' : 'Des actions correctives restent à mener.',
                },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className={`rounded-xl ${bg} px-4 py-3`}>
                  <p className={`font-semibold flex items-center gap-1.5 ${color}`}>
                    <Icon className="h-4 w-4" />{title}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pied de page rapport */}
        <div className="text-center text-xs text-muted-foreground border-t pt-4 print:pt-6">
          Rapport généré le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          {' '}— Commune de {user?.mairieName ?? 'Mairie'} — Application de gestion des lampadaires
        </div>
      </div>
    </div>
  );
};
