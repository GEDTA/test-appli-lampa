import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ChartContainer } from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { Euro, TrendingDown, Wrench, Download, Info, Zap } from 'lucide-react';
import {
  INTERVENTIONS,
  INTERVENTION_TYPE_LABELS,
  INTERVENTION_TYPE_COLORS,
  type InterventionType,
} from '@/data/interventions';
import { useLampPosts } from '@/context/LampContext';
import { useSettings } from '@/context/SettingsContext';
import { calcLedSavingsPerYear } from '@/utils/energy';

const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026'];
const TYPES = Object.keys(INTERVENTION_TYPE_LABELS) as InterventionType[];

// Bar colors: highlighted year vs others
const BAR_COLOR_ACTIVE = '#3b82f6';
const BAR_COLOR_MUTED = '#94a3b8';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const Costs = () => {
  const { lampPosts } = useLampPosts();
  const { settings } = useSettings();
  const { hoursPerNight, kwhPrice, ledPower, classicPower } = settings;
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showLedDetail, setShowLedDetail] = useState(false);

  // --- Bloc 1: summary stats ---
  const totalCost2025 = useMemo(
    () =>
      INTERVENTIONS.filter((i) => i.date.startsWith('2025')).reduce(
        (sum, i) => sum + i.cost,
        0
      ),
    []
  );

  const avgCost = useMemo(() => {
    if (INTERVENTIONS.length === 0) return 0;
    const total = INTERVENTIONS.reduce((sum, i) => sum + i.cost, 0);
    return total / INTERVENTIONS.length;
  }, []);

  const classicCount = useMemo(
    () => lampPosts.filter((l) => l.status === 'classic').length,
    [lampPosts]
  );

  const ledSavingsPerYear = useMemo(
    () => calcLedSavingsPerYear(classicCount, ledPower, classicPower, hoursPerNight, kwhPrice),
    [classicCount, ledPower, classicPower, hoursPerNight, kwhPrice]
  );

  // --- Bloc 2: chart data ---
  const chartData = useMemo(
    () =>
      YEARS.map((year) => ({
        year,
        total: INTERVENTIONS.filter((i) => i.date.startsWith(year)).reduce(
          (sum, i) => sum + i.cost,
          0
        ),
      })),
    []
  );

  // --- Bloc 3: filtered table ---
  const filtered = useMemo(
    () =>
      INTERVENTIONS.filter((i) => {
        if (yearFilter !== 'all' && !i.date.startsWith(yearFilter)) return false;
        if (typeFilter !== 'all' && i.type !== typeFilter) return false;
        return true;
      }),
    [yearFilter, typeFilter]
  );

  const filteredTotal = useMemo(
    () => filtered.reduce((sum, i) => sum + i.cost, 0),
    [filtered]
  );

  // --- CSV export ---
  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Coût (€)', 'Lampadaire', 'Rue', 'Prestataire', 'Commentaire'];
    const rows = filtered.map((i) => [
      i.id,
      i.date,
      INTERVENTION_TYPE_LABELS[i.type],
      i.cost,
      i.lampId,
      i.street,
      i.provider,
      `"${i.comment}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interventions_${yearFilter === 'all' ? 'toutes' : yearFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // LED detail values
  const totalClassicPowerW = classicCount * classicPower;
  const totalLedPowerW = classicCount * ledPower;
  const annualHours = hoursPerNight * 365;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Coûts de maintenance</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Suivi budgétaire des interventions sur le parc lumineux de La Wantzenau (2021 – 2026).
        </p>
      </div>

      {/* ── Bloc 1 : résumé budgétaire ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-50 via-white to-white shadow-sm dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût annuel total</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{fmt(totalCost2025)}</div>
            <p className="text-xs text-muted-foreground">Total des interventions en 2025</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-white shadow-sm dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût moyen / intervention</CardTitle>
            <Wrench className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{fmt(avgCost)}</div>
            <p className="text-xs text-muted-foreground">Moyenne sur toutes les années</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies potentielles LED</CardTitle>
            <TrendingDown className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-600">{fmt(ledSavingsPerYear)} / an</div>
            <p className="text-xs text-muted-foreground mb-3">
              Si les {classicCount} lampadaires classiques passent en LED
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowLedDetail(true)}
            >
              <Info className="h-3.5 w-3.5" />
              Détail du calcul
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Bloc 2 : graphique annuel ── */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Dépenses par année</CardTitle>
          <CardDescription>Total des coûts d'intervention annuels (2026 = données partielles)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" tick={{ fontSize: 13 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k€`}
                  tick={{ fontSize: 12 }}
                  width={52}
                />
                <Tooltip
                  formatter={(value: number) => [fmt(value), 'Total']}
                  contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.year}
                      fill={entry.year === '2025' ? BAR_COLOR_ACTIVE : BAR_COLOR_MUTED}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ── Bloc 3 : tableau détaillé ── */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Détail des interventions</CardTitle>
              <CardDescription className="mt-1">
                {filtered.length} intervention{filtered.length > 1 ? 's' : ''} — total {fmt(filteredTotal)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes années</SelectItem>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{INTERVENTION_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={exportCSV}>
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Coût</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lampadaire</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Prestataire</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((intervention, idx) => (
                  <tr
                    key={intervention.id}
                    className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${
                      idx % 2 === 0 ? '' : 'bg-muted/10'
                    }`}
                  >
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {new Date(intervention.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs font-normal ${INTERVENTION_TYPE_COLORS[intervention.type]}`}>
                        {INTERVENTION_TYPE_LABELS[intervention.type]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {fmt(intervention.cost)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{intervention.lampId}</span>
                      <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">{intervention.street}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {intervention.provider}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell max-w-xs truncate">
                      {intervention.comment}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Aucune intervention pour ces critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Modal : détail économies LED ── */}
      <Dialog open={showLedDetail} onOpenChange={setShowLedDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-600" />
              Détail du calcul LED
            </DialogTitle>
            <DialogDescription>
              Estimation des économies annuelles si le parc classique est converti en LED.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="rounded-lg border bg-muted/40 divide-y text-sm">
              <div className="flex justify-between px-4 py-3">
                <span className="text-muted-foreground">Lampadaires classiques concernés</span>
                <span className="font-medium">{classicCount} unités</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-muted-foreground">Puissance actuelle (classique)</span>
                <span className="font-medium">{classicPower} W / unité → {(totalClassicPowerW / 1000).toFixed(1)} kW total</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-muted-foreground">Puissance LED estimée</span>
                <span className="font-medium">{ledPower} W / unité → {(totalLedPowerW / 1000).toFixed(1)} kW total</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-muted-foreground">Durée d'éclairage annuelle</span>
                <span className="font-medium">{hoursPerNight}h/nuit × 365 jours = {annualHours.toLocaleString('fr-FR')} h/an</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-muted-foreground">Prix du kWh</span>
                <span className="font-medium">{kwhPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 px-4 py-4 space-y-1">
              <p className="text-xs text-muted-foreground">Méthode de calcul</p>
              <p className="text-sm font-mono text-foreground">
                {classicCount} × ({classicPower}W − {ledPower}W) × {annualHours.toLocaleString('fr-FR')}h × {kwhPrice}€ ÷ 1 000
              </p>
              <p className="text-2xl font-bold text-emerald-600 pt-1">
                = {fmt(ledSavingsPerYear)} / an
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Ce calcul n'intègre pas le coût d'investissement du remplacement. Hors subventions ADEME et CEE éventuelles.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
