import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Leaf, Zap, Wind, TrendingDown, Lightbulb, Euro } from 'lucide-react';
import { DONNEES_ENERGETIQUES } from '@/data/energetique';
import { useSettings } from '@/context/SettingsContext';
import { useLampPosts } from '@/context/LampContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);
const fmtEur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  colorClass: string;
}
const KpiCard = ({ icon: Icon, label, value, sub, colorClass }: KpiCardProps) => (
  <Card className={`border-0 shadow-sm bg-gradient-to-br ${colorClass}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{label}</CardTitle>
      <Icon className="h-4 w-4 opacity-70" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </CardContent>
  </Card>
);

export const Energie = () => {
  const { settings } = useSettings();
  const { lampPosts } = useLampPosts();

  const derniere = DONNEES_ENERGETIQUES.filter((d) => !d.partielle).at(-1)!;
  const premiere = DONNEES_ENERGETIQUES[0];

  const totalEconomiesKwh = useMemo(
    () => DONNEES_ENERGETIQUES.filter((d) => !d.partielle).reduce((s, d) => s + d.economiesKwh, 0),
    []
  );
  const totalCo2Evite = useMemo(
    () => DONNEES_ENERGETIQUES.filter((d) => !d.partielle).reduce((s, d) => s + d.co2Evite, 0),
    []
  );
  const totalEconomiesEur = useMemo(
    () => DONNEES_ENERGETIQUES.filter((d) => !d.partielle).reduce((s, d) => s + (d.economiesKwh * settings.kwhPrice), 0),
    [settings.kwhPrice]
  );

  const ledRate = lampPosts.length > 0
    ? Math.round((lampPosts.filter((l) => l.status === 'led').length / lampPosts.length) * 100)
    : Math.round((derniere.nbLed / derniere.nbTotal) * 100);

  // Données chart consommation comparée
  const consumptionData = DONNEES_ENERGETIQUES.map((d) => ({
    annee: String(d.annee),
    'Parc réel': d.consommationKwh,
    'Si tout classique': d.baselineKwh,
    partielle: d.partielle,
  }));

  // Données chart LED vs classique
  const parcData = DONNEES_ENERGETIQUES.map((d) => ({
    annee: String(d.annee),
    LED: d.nbLed,
    Classique: d.nbClassic,
  }));

  // Données chart CO₂
  const co2Data = DONNEES_ENERGETIQUES.map((d) => ({
    annee: String(d.annee),
    'CO₂ émis': d.co2Emis,
    'CO₂ évité': d.co2Evite,
  }));

  const reductionPct = Math.round(
    ((premiere.consommationKwh - derniere.consommationKwh) / premiere.consommationKwh) * 100
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
          <Leaf className="h-3 w-3" />
          Transition énergétique — 2020 → 2026
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Performances énergétiques</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Suivi de la consommation avant et après la transition LED. Économies réalisées et CO₂ évité depuis {premiere.annee}.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Zap}
          label="Réduction de conso."
          value={`− ${reductionPct} %`}
          sub={`${fmt(premiere.consommationKwh)} → ${fmt(derniere.consommationKwh)} kWh/an`}
          colorClass="from-blue-50 via-white to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900"
        />
        <KpiCard
          icon={TrendingDown}
          label="Économies cumulées"
          value={fmtEur(totalEconomiesEur)}
          sub={`${fmt(totalEconomiesKwh)} kWh non consommés depuis ${premiere.annee}`}
          colorClass="from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900"
        />
        <KpiCard
          icon={Wind}
          label="CO₂ évité (cumulé)"
          value={`${(totalCo2Evite / 1000).toFixed(1)} t`}
          sub="Tonnes de CO₂ non émises depuis le début"
          colorClass="from-teal-50 via-white to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900"
        />
        <KpiCard
          icon={Lightbulb}
          label="Taux LED actuel"
          value={`${ledRate} %`}
          sub={`${derniere.nbLed} LED · ${derniere.nbClassic} classiques`}
          colorClass="from-amber-50 via-white to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900"
        />
      </div>

      {/* Graphique 1 : consommation comparée */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            Consommation réelle vs baseline 100% classique
          </CardTitle>
          <CardDescription>
            La zone verte représente les kWh économisés grâce à la transition LED (kWh/an).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionData} margin={{ top: 8, right: 24, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="annee" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={40} />
                <Tooltip
                  formatter={(v: number, name: string) => [`${fmt(v)} kWh`, name]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="Si tout classique" stroke="#94a3b8" fill="url(#gradBaseline)" strokeWidth={1.5} strokeDasharray="4 3" />
                <Area type="monotone" dataKey="Parc réel" stroke="#3b82f6" fill="url(#gradReal)" strokeWidth={2.5} />
                <ReferenceLine x="2026" stroke="#f59e0b" strokeDasharray="4 3" label={{ value: 'partiel', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Graphiques 2+3 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Évolution du parc */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              Évolution du parc
            </CardTitle>
            <CardDescription>Nombre de lampadaires LED vs classiques par année</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parcData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="annee" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} width={32} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="LED" stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Classique" stackId="a" fill="#ca8a04" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* CO₂ */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-teal-600" />
              Bilan CO₂ annuel
            </CardTitle>
            <CardDescription>CO₂ émis par le parc et CO₂ évité grâce aux LED (kg/an)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={co2Data} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="annee" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(1)}t`} tick={{ fontSize: 11 }} width={40} />
                  <Tooltip
                    formatter={(v: number, name: string) => [`${fmt(v)} kg`, name]}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="CO₂ émis" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="CO₂ évité" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau récapitulatif */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-slate-600" />
            Tableau récapitulatif annuel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Année</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">LED</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Classique</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Conso. (kWh)</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Économies (kWh)</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Coût énergie</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">CO₂ évité</th>
                </tr>
              </thead>
              <tbody>
                {DONNEES_ENERGETIQUES.map((d, i) => (
                  <tr key={d.annee} className={`border-b last:border-0 ${d.partielle ? 'opacity-60 italic' : ''} ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-2.5 font-medium">
                      {d.annee}{d.partielle && <span className="ml-1 text-xs text-amber-600">(partiel)</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right text-emerald-700 dark:text-emerald-400 font-medium">{d.nbLed}</td>
                    <td className="px-4 py-2.5 text-right text-amber-700 dark:text-amber-400">{d.nbClassic}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(d.consommationKwh)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-700 dark:text-emerald-400 tabular-nums font-medium">+{fmt(d.economiesKwh)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmtEur(d.coutEnergie)}</td>
                    <td className="px-4 py-2.5 text-right text-teal-700 dark:text-teal-400 tabular-nums">
                      {d.co2Evite >= 1000 ? `${(d.co2Evite / 1000).toFixed(1)} t` : `${fmt(d.co2Evite)} kg`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
