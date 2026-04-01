import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { useLampPosts } from '@/context/LampContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { calcAnnualKwh } from '@/utils/energy';
import { Leaf, Zap, Lightbulb, Wrench, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: string;
}

const ProgressBar = ({ value, max = 100, color = 'bg-emerald-500', height = 'h-2' }: ProgressBarProps) => (
  <div className={`${height} w-full rounded-full bg-muted overflow-hidden`}>
    <div
      className={`h-full rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min(100, (value / max) * 100).toFixed(1)}%` }}
    />
  </div>
);

export const Analytics = () => {
  const { lampPosts } = useLampPosts();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { hoursPerNight, ledPower, classicPower, co2Factor, ledTargetPct } = settings;

  const stats = useMemo(() => {
    const led = lampPosts.filter((l) => l.status === 'led').length;
    const classic = lampPosts.filter((l) => l.status === 'classic').length;
    const out = lampPosts.filter((l) => l.status === 'out').length;
    const total = lampPosts.length;

    const ledRate = total > 0 ? (led / total) * 100 : 0;
    const operationalRate = total > 0 ? ((total - out) / total) * 100 : 0;
    const annualKwh = calcAnnualKwh(led, classic, ledPower, classicPower, hoursPerNight);

    return { led, classic, out, total, ledRate, operationalRate, annualKwh };
  }, [lampPosts, hoursPerNight, ledPower, classicPower]);

  const progressToTarget = ledTargetPct > 0
    ? Math.min(100, (stats.ledRate / ledTargetPct) * 100)
    : 0;
  const remaining = Math.max(0, Math.ceil(stats.total * (ledTargetPct / 100) - stats.led));

  const distribution = [
    { name: 'LED', value: stats.led, fill: '#16a34a' },
    { name: 'Classique', value: stats.classic, fill: '#3f6212' },
    { name: 'HS', value: stats.out, fill: '#dc2626' },
  ];

  const consumptionBars = [
    { name: 'LED', value: Math.round(stats.led * ledPower), fill: '#16a34a' },
    { name: 'Classique', value: Math.round(stats.classic * classicPower), fill: '#3f6212' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
          <Leaf className="h-3 w-3" />
          Transition énergétique — {user?.mairieName ?? '…'}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Suivi de la consommation et de la transition vers l'éclairage LED. Hypothèse : {hoursPerNight}h/nuit.
          Facteur CO₂ réseau France : {co2Factor} kg/kWh (ADEME 2023).
        </p>
      </div>

      {/* ── Objectif LED 2026 — hero ── */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-blue-950/30 dark:via-slate-900 dark:to-emerald-950/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Objectif municipal — 100% LED d'ici 2026</CardTitle>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
              <TrendingUp className="h-3.5 w-3.5" />
              {progressToTarget.toFixed(0)}% atteint
            </div>
          </div>
          <CardDescription>
            {stats.led} lampadaires convertis sur{' '}
            {Math.ceil(stats.total * (ledTargetPct / 100))} visés (objectif {ledTargetPct}%) —{' '}
            {remaining > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">{remaining} à convertir</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 inline-flex">
                <CheckCircle2 className="h-3.5 w-3.5" /> Objectif atteint !
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Double barre */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5" /> Parc LED actuel
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{stats.ledRate.toFixed(1)}%</span>
              </div>
              <ProgressBar value={stats.ledRate} height="h-5" color="bg-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progression vers l'objectif {ledTargetPct}%</span>
                <span>{progressToTarget.toFixed(0)}%</span>
              </div>
              <ProgressBar value={progressToTarget} height="h-2" color="bg-blue-400" />
            </div>
          </div>

          {/* Compteurs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.led}</p>
              <p className="text-xs text-muted-foreground mt-0.5">LED installées</p>
            </div>
            <div className="rounded-xl bg-amber-100/60 dark:bg-amber-950/40 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.classic}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Classiques restants</p>
            </div>
            <div className="rounded-xl bg-blue-100/60 dark:bg-blue-950/40 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{remaining}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Restants / objectif</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Parc lumineux ── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          État du parc
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parc LED</CardTitle>
              <Leaf className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stats.led}</div>
              <div className="mt-2">
                <ProgressBar value={stats.ledRate} color="bg-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.ledRate.toFixed(0)}% du parc — basse consommation</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-lime-50 via-white to-white shadow-sm dark:from-lime-950/40 dark:via-slate-900 dark:to-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parc classique</CardTitle>
              <Lightbulb className="h-4 w-4 text-lime-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stats.classic}</div>
              <div className="mt-2">
                <ProgressBar
                  value={(stats.classic / stats.total) * 100}
                  color="bg-lime-500"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{((stats.classic / stats.total) * 100).toFixed(0)}% du parc — en transition</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-rose-50 via-white to-white shadow-sm dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hors service</CardTitle>
              <Wrench className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stats.out}</div>
              <div className="mt-2">
                <ProgressBar
                  value={(stats.out / stats.total) * 100}
                  color="bg-rose-500"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.out / stats.total) * 100).toFixed(0)}% — taux d'anomalie réseau
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-white shadow-sm dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consommation annuelle</CardTitle>
              <Zap className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stats.annualKwh.toFixed(0)} kWh</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(stats.annualKwh * co2Factor).toFixed(0)} kg CO₂ / an émis
              </p>
              <p className="text-xs text-muted-foreground">Estimation parc actuel</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Graphiques ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Répartition des états</CardTitle>
            <CardDescription>Couverture globale du parc lumineux</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={45}
                    labelLine={false}
                    label={(e: { name: string; value: number }) => `${e.name}: ${e.value}`}
                    dataKey="value"
                  >
                    {distribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, 'Lampadaires']} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Consommation instantanée par type</CardTitle>
            <CardDescription>Puissance totale estimée (W) · actuelle vs si 100% LED</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={consumptionBars}
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `${v} W`} width={60} />
                  <Tooltip formatter={(v: number) => [`${v} W`, 'Puissance']} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {consumptionBars.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
