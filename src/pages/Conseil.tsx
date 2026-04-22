import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Leaf, Wind, Zap, Euro, Activity, TrendingDown, CheckCircle2 } from 'lucide-react';
import { useLampPosts } from '@/context/LampContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { DONNEES_ENERGETIQUES } from '@/data/energetique';
import { INTERVENTIONS } from '@/data/interventions';
import { calcAnnualKwh, calcBaselineKwh } from '@/utils/energy';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);
const fmtEur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

interface IndicateurProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  accent: string;
  bg: string;
}

const Indicateur = ({ icon: Icon, label, value, delta, deltaPositive, accent, bg }: IndicateurProps) => (
  <div className={`rounded-2xl ${bg} px-6 py-5`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-4xl font-black mt-1 ${accent}`}>{value}</p>
        {delta && (
          <p className={`text-xs mt-1 font-medium ${deltaPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {deltaPositive ? '▲' : '▼'} {delta}
          </p>
        )}
      </div>
      <Icon className={`h-8 w-8 opacity-20 ${accent}`} />
    </div>
  </div>
);

export const Conseil = () => {
  const { lampPosts } = useLampPosts();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { hoursPerNight, ledPower, classicPower, co2Factor, kwhPrice } = settings;

  const led     = lampPosts.filter((l) => l.status === 'led').length;
  const classic = lampPosts.filter((l) => l.status === 'classic').length;
  const out     = lampPosts.filter((l) => l.status === 'out').length;
  const total   = lampPosts.length;

  const ledRate          = total > 0 ? (led / total) * 100 : 0;
  const operationalRate  = total > 0 ? ((total - out) / total) * 100 : 0;
  const healthScore      = Math.round(ledRate * 0.6 + operationalRate * 0.4);

  const annualKwh  = calcAnnualKwh(led, classic, ledPower, classicPower, hoursPerNight);
  const baselineKwh = calcBaselineKwh(total, classicPower, hoursPerNight);
  const savedKwh   = baselineKwh - annualKwh;
  const savedEur   = savedKwh * kwhPrice;
  const savedCo2Kg = savedKwh * co2Factor;

  const coutMaint2025 = useMemo(
    () => INTERVENTIONS.filter((i) => i.date.startsWith('2025')).reduce((s, i) => s + i.cost, 0),
    []
  );
  const coutMaint2024 = useMemo(
    () => INTERVENTIONS.filter((i) => i.date.startsWith('2024')).reduce((s, i) => s + i.cost, 0),
    []
  );
  const diffMaint = coutMaint2025 - coutMaint2024;

  const scoreColor =
    healthScore >= 80 ? 'text-emerald-600' : healthScore >= 60 ? 'text-amber-500' : 'text-rose-600';

  // Tendance consommation
  const trendData = DONNEES_ENERGETIQUES.map((d) => ({
    annee: String(d.annee),
    'Consommation (kWh)': d.consommationKwh,
    'Économies (kWh)': d.economiesKwh,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Conseil municipal</p>
            <h1 className="text-3xl font-bold">Tableau de bord décisionnel</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Commune de {user?.mairieName ?? 'Mairie'} — Éclairage public
            </p>
          </div>
          <div className="text-center md:text-right">
            <div className={`text-6xl font-black ${scoreColor}`}>{healthScore}</div>
            <div className="text-slate-400 text-sm">Score vert / 100</div>
          </div>
        </div>
      </div>

      {/* Indicateurs principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Indicateur
          icon={Leaf}
          label="Lampadaires LED"
          value={`${ledRate.toFixed(0)} %`}
          delta={`${led} sur ${total} convertis`}
          deltaPositive
          accent="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <Indicateur
          icon={Activity}
          label="Disponibilité réseau"
          value={`${operationalRate.toFixed(0)} %`}
          delta={`${out} hors service`}
          deltaPositive={out === 0}
          accent="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-950/30"
        />
        <Indicateur
          icon={TrendingDown}
          label="Économies énergie / an"
          value={fmtEur(savedEur)}
          delta={`${fmt(savedKwh)} kWh non consommés`}
          deltaPositive
          accent="text-teal-600"
          bg="bg-teal-50 dark:bg-teal-950/30"
        />
        <Indicateur
          icon={Wind}
          label="CO₂ évité / an"
          value={savedCo2Kg >= 1000 ? `${(savedCo2Kg / 1000).toFixed(1)} t` : `${fmt(savedCo2Kg)} kg`}
          delta="grâce à la transition LED"
          deltaPositive
          accent="text-teal-600"
          bg="bg-teal-50/60 dark:bg-teal-950/20"
        />
        <Indicateur
          icon={Euro}
          label="Budget maintenance 2025"
          value={fmtEur(coutMaint2025)}
          delta={`${diffMaint >= 0 ? '+' : ''}${fmtEur(diffMaint)} vs 2024`}
          deltaPositive={diffMaint < 0}
          accent="text-slate-700 dark:text-slate-300"
          bg="bg-slate-50 dark:bg-slate-800/40"
        />
        <Indicateur
          icon={Zap}
          label="Conso. annuelle estimée"
          value={`${(annualKwh / 1000).toFixed(1)} MWh`}
          delta={`Baseline 100% classique : ${(baselineKwh / 1000).toFixed(1)} MWh`}
          deltaPositive
          accent="text-blue-700 dark:text-blue-300"
          bg="bg-blue-50/60 dark:bg-blue-950/20"
        />
      </div>

      {/* Graphique tendance */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-600" />
            Tendance de consommation et économies (kWh/an)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 24, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="gConso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gEco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="annee" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={40} />
                <Tooltip formatter={(v: number, n: string) => [`${fmt(v)} kWh`, n]} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="Consommation (kWh)" stroke="#3b82f6" fill="url(#gConso)" strokeWidth={2} />
                <Area type="monotone" dataKey="Économies (kWh)" stroke="#10b981" fill="url(#gEco)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Messages clés pour les élus */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            title: 'Transition LED',
            msg: `${led} lampadaires sur ${total} convertis. Objectif 90 % atteint${ledRate >= 90 ? ' ✓' : ` — encore ${Math.ceil(total * 0.9 - led)} à convertir`}.`,
          },
          {
            icon: Euro,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            title: 'Impact budgétaire',
            msg: `Les LED génèrent ${fmtEur(savedEur)} d'économies énergétiques par an. Cela représente une réduction de ${Math.round((savedKwh / baselineKwh) * 100)} % de la facture énergétique.`,
          },
          {
            icon: Wind,
            color: 'text-teal-600',
            bg: 'bg-teal-50 dark:bg-teal-950/30',
            title: 'Engagement environnemental',
            msg: `${savedCo2Kg >= 1000 ? `${(savedCo2Kg / 1000).toFixed(1)} tonnes` : `${fmt(savedCo2Kg)} kg`} de CO₂ évités chaque année. Soit l'équivalent de ${Math.round(savedCo2Kg / 120)} trajets Paris-Strasbourg en voiture.`,
          },
        ].map(({ icon: Icon, color, bg, title, msg }) => (
          <div key={title} className={`rounded-xl ${bg} px-5 py-4`}>
            <p className={`font-semibold flex items-center gap-1.5 ${color} mb-2`}>
              <Icon className="h-4 w-4" />{title}
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">{msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
