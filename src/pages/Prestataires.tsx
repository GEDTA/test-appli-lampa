import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer } from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Wrench, Euro, Clock, TrendingUp, Award } from 'lucide-react';
import { INTERVENTIONS, INTERVENTION_TYPE_LABELS, INTERVENTION_TYPE_COLORS } from '@/data/interventions';
import type { InterventionType } from '@/data/interventions';

const fmtEur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

const PROVIDER_COLORS: Record<string, string> = {
  'SERUE Éclairage': '#3b82f6',
  'ELEC 67':         '#f59e0b',
  'Régie municipale':'#10b981',
  'CITELUM':         '#8b5cf6',
};

export const Prestataires = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Stats par prestataire
  const providerStats = useMemo(() => {
    const map = new Map<string, { interventions: number; totalCost: number; types: Record<string, number> }>();

    for (const i of INTERVENTIONS) {
      if (!map.has(i.provider)) {
        map.set(i.provider, { interventions: 0, totalCost: 0, types: {} });
      }
      const s = map.get(i.provider)!;
      s.interventions += 1;
      s.totalCost += i.cost;
      s.types[i.type] = (s.types[i.type] ?? 0) + 1;
    }

    return Array.from(map.entries())
      .map(([name, s]) => ({
        name,
        interventions: s.interventions,
        totalCost: s.totalCost,
        avgCost: Math.round(s.totalCost / s.interventions),
        types: s.types,
        color: PROVIDER_COLORS[name] ?? '#94a3b8',
      }))
      .sort((a, b) => b.totalCost - a.totalCost);
  }, []);

  // Evolution annuelle par prestataire
  const yearlyData = useMemo(() => {
    const years = ['2021', '2022', '2023', '2024', '2025'];
    return years.map((year) => {
      const entry: Record<string, number | string> = { year };
      for (const p of providerStats) {
        entry[p.name] = INTERVENTIONS
          .filter((i) => i.date.startsWith(year) && i.provider === p.name)
          .reduce((s, i) => s + i.cost, 0);
      }
      return entry;
    });
  }, [providerStats]);

  // Interventions filtrées par prestataire sélectionné
  const filteredInterventions = useMemo(() => {
    if (!selectedProvider) return [];
    return INTERVENTIONS
      .filter((i) => i.provider === selectedProvider)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 20);
  }, [selectedProvider]);

  const topProvider = providerStats[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Gestion des prestataires</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Suivi des performances, coûts et interventions par prestataire. Comparez facilement les acteurs du marché.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 via-white to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prestataires actifs</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{providerStats.length}</div>
            <p className="text-xs text-muted-foreground">Intervenants depuis 2021</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total interventions</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{fmt(INTERVENTIONS.length)}</div>
            <p className="text-xs text-muted-foreground">Sur l'ensemble des années</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget total</CardTitle>
            <Euro className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {fmtEur(INTERVENTIONS.reduce((s, i) => s + i.cost, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Toutes années confondues</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prestataire principal</CardTitle>
            <Award className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold leading-tight">{topProvider?.name}</div>
            <p className="text-xs text-muted-foreground">{topProvider?.interventions} interventions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau comparatif */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Tableau comparatif</CardTitle>
          <CardDescription>Cliquez sur une ligne pour voir le détail des interventions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Prestataire</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Interventions</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Coût total</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Coût moyen</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Types fréquents</th>
                </tr>
              </thead>
              <tbody>
                {providerStats.map((p, i) => {
                  const topTypes = Object.entries(p.types)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([type]) => type as InterventionType);
                  const isSelected = selectedProvider === p.name;
                  return (
                    <tr
                      key={p.name}
                      onClick={() => setSelectedProvider(isSelected ? null : p.name)}
                      className={`border-b last:border-0 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-950/20' : i % 2 === 0 ? 'hover:bg-muted/30' : 'bg-muted/10 hover:bg-muted/30'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{p.interventions}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtEur(p.totalCost)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{fmtEur(p.avgCost)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {topTypes.map((t) => (
                            <Badge key={t} className={`text-xs font-normal ${INTERVENTION_TYPE_COLORS[t]}`}>
                              {INTERVENTION_TYPE_LABELS[t]}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Graphique évolution annuelle */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Répartition budgétaire par année</CardTitle>
          <CardDescription>Coûts annuels ventilés par prestataire (€)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} tick={{ fontSize: 11 }} width={44} />
                <Tooltip
                  formatter={(v: number, name: string) => [fmtEur(v), name]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                {providerStats.map((p) => (
                  <Bar key={p.name} dataKey={p.name} stackId="a" fill={p.color}
                    radius={p.name === providerStats.at(-1)?.name ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Détail prestataire sélectionné */}
      {selectedProvider && filteredInterventions.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4" style={{ borderLeftColor: PROVIDER_COLORS[selectedProvider] ?? '#94a3b8' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              20 dernières interventions — {selectedProvider}
            </CardTitle>
            <CardDescription>Cliquez à nouveau sur la ligne pour fermer</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Coût</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Lampadaire</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground hidden md:table-cell">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterventions.map((i, idx) => (
                    <tr key={i.id} className={`border-b last:border-0 ${idx % 2 !== 0 ? 'bg-muted/10' : ''}`}>
                      <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                        {new Date(i.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge className={`text-xs font-normal ${INTERVENTION_TYPE_COLORS[i.type]}`}>
                          {INTERVENTION_TYPE_LABELS[i.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtEur(i.cost)}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{i.lampId}</td>
                      <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell max-w-xs truncate">{i.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
