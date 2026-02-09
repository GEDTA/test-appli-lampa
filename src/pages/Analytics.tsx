import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { LAMP_POWER_WATTS } from '@/types/lamp.types';
import { useLampPosts } from '@/context/LampContext';
import { Leaf, Zap, Lightbulb, Wrench } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const HOURS_PER_NIGHT = 9;
const LIGHTING_WINDOW = '21h à 6h';
const DAYS_PER_YEAR = 365;

export const Analytics = () => {
  const { lampPosts } = useLampPosts();

  const stats = useMemo(() => {
    const led = lampPosts.filter((lamp) => lamp.status === 'led').length;
    const classic = lampPosts.filter((lamp) => lamp.status === 'classic').length;
    const out = lampPosts.filter((lamp) => lamp.status === 'out').length;
    const total = lampPosts.length;

    const nightlyConsumptionWh =
      led * LAMP_POWER_WATTS.led + classic * LAMP_POWER_WATTS.classic;
    const annualConsumptionKwh =
      (nightlyConsumptionWh * HOURS_PER_NIGHT * DAYS_PER_YEAR) / 1000;

    return {
      led,
      classic,
      out,
      total,
      nightlyConsumptionWh,
      annualConsumptionKwh,
    };
  }, [lampPosts]);

  const distribution = [
    { name: 'LED', value: stats.led, fill: '#16a34a' },
    { name: 'Classique', value: stats.classic, fill: '#3f6212' },
    { name: 'HS', value: stats.out, fill: '#dc2626' },
  ];

  const consumptionBars = [
    { name: 'LED', value: stats.led * LAMP_POWER_WATTS.led, fill: '#16a34a' },
    { name: 'Classique', value: stats.classic * LAMP_POWER_WATTS.classic, fill: '#3f6212' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Suivi de la consommation et de la transition vers l’éclairage LED. Hypothèse de calcul :
          {` ${HOURS_PER_NIGHT}h`} d’éclairage par nuit ({LIGHTING_WINDOW}).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parc LED</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.led}</div>
            <p className="text-xs text-muted-foreground">Lampadaires à faible consommation</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-lime-50 via-white to-white shadow-sm dark:from-lime-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parc classique</CardTitle>
            <Lightbulb className="h-4 w-4 text-lime-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.classic}</div>
            <p className="text-xs text-muted-foreground">Technologie en transition</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 via-white to-white shadow-sm dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hors service</CardTitle>
            <Wrench className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.out}</div>
            <p className="text-xs text-muted-foreground">Unités à réparer</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-white shadow-sm dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consommation annuelle</CardTitle>
            <Zap className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.annualConsumptionKwh.toFixed(0)} kWh</div>
            <p className="text-xs text-muted-foreground">Estimation annuelle du parc</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Répartition des états</CardTitle>
            <CardDescription>Couverture globale du parc lumineux</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${entry.value}`}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Consommation par type</CardTitle>
            <CardDescription>Consommation instantanée estimée par type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionBars}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {consumptionBars.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
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
