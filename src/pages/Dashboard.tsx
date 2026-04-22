import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LampMap } from '@/components/map/LampMap';
import { LAMP_STATUS_COLORS, LAMP_STATUS_LABELS } from '@/types/lamp.types';
import type { LampStatus } from '@/types/lamp.types';
import { AlertTriangle, Leaf, Lightbulb, MapPin, Wind, Activity } from 'lucide-react';
import { useLampPosts } from '@/context/LampContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { calcAnnualKwh, calcBaselineKwh } from '@/utils/energy';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
}

const ProgressBar = ({ value, max = 100, color = 'bg-emerald-500' }: ProgressBarProps) => (
  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min(100, (value / max) * 100).toFixed(1)}%` }}
    />
  </div>
);

export const Dashboard = () => {
  const { lampPosts, updateLampStatus, addLampPost } = useLampPosts();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { hoursPerNight, ledPower, classicPower, co2Factor, defaultZoom, showClusters } = settings;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selectedLampId, setSelectedLampId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = lampPosts.length;
    const led = lampPosts.filter((l) => l.status === 'led').length;
    const classic = lampPosts.filter((l) => l.status === 'classic').length;
    const out = lampPosts.filter((l) => l.status === 'out').length;

    const ledRate = total > 0 ? (led / total) * 100 : 0;
    const operationalRate = total > 0 ? ((total - out) / total) * 100 : 0;
    const healthScore = Math.round(ledRate * 0.6 + operationalRate * 0.4);

    const annualKwh = calcAnnualKwh(led, classic, ledPower, classicPower, hoursPerNight);
    const baselineKwh = calcBaselineKwh(total, classicPower, hoursPerNight);
    const savedKgCo2 = (baselineKwh - annualKwh) * co2Factor;

    return { total, led, classic, out, ledRate, operationalRate, healthScore, savedKgCo2 };
  }, [lampPosts, hoursPerNight, ledPower, classicPower, co2Factor]);

  const healthColor =
    stats.healthScore >= 80
      ? 'text-emerald-600'
      : stats.healthScore >= 60
      ? 'text-amber-500'
      : 'text-rose-600';

  const healthBarColor =
    stats.healthScore >= 80
      ? 'bg-emerald-500'
      : stats.healthScore >= 60
      ? 'bg-amber-400'
      : 'bg-rose-500';

  const priorityIssues = useMemo(
    () =>
      lampPosts
        .filter((l) => l.status === 'out')
        .sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1))
        .slice(0, 6),
    [lampPosts]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Suivi temps réel — {user?.mairieName ?? '…'}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Carte intelligente</h1>
        <p className="text-muted-foreground max-w-2xl">
          Visualisez l'état du parc lumineux, identifiez les anomalies et mettez à jour les
          informations directement sur la carte.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lampadaires LED</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.led}</div>
            <div className="mt-2">
              <ProgressBar value={stats.ledRate} color="bg-emerald-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.ledRate.toFixed(0)}% du parc</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-lime-50 via-white to-white shadow-sm dark:from-lime-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lampadaires classiques</CardTitle>
            <Lightbulb className="h-4 w-4 text-lime-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.classic}</div>
            <div className="mt-2">
              <ProgressBar value={(stats.total > 0 ? (stats.classic / stats.total) * 100 : 0)} color="bg-lime-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">En transition vers LED</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 via-white to-white shadow-sm dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hors service</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.out}</div>
            <div className="mt-2">
              <ProgressBar value={(stats.total > 0 ? (stats.out / stats.total) * 100 : 0)} color="bg-rose-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Interventions requises</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-white shadow-sm dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total géré</CardTitle>
            <MapPin className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.total}</div>
            <div className="mt-2">
              <ProgressBar value={stats.operationalRate} color="bg-slate-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.operationalRate.toFixed(0)}% opérationnels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map + side panels */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Map */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Carte dynamique</CardTitle>
            <CardDescription>
              Zoom par zones puis par rues. Cliquez sur un point pour modifier l'état.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4" ref={mapRef}>
            <LampMap
              lampPosts={lampPosts}
              onUpdateStatus={updateLampStatus}
              onAddLamp={addLampPost}
              selectedLampId={selectedLampId}
              center={user ? [user.centerLat, user.centerLng] : undefined}
              defaultZoom={defaultZoom}
              showClusters={showClusters}
            />
            {selectedLampId && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-300">
                Lampadaire sélectionné :{' '}
                <span className="font-semibold">{selectedLampId}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {(['led', 'classic', 'out'] as LampStatus[]).map((status) => (
                <span key={status} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: LAMP_STATUS_COLORS[status] }}
                  />
                  {LAMP_STATUS_LABELS[status]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side panels */}
        <div className="space-y-6">
          {/* Priority issues */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Interventions prioritaires
              </CardTitle>
              <CardDescription>Lampadaires HS à traiter en premier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {priorityIssues.length === 0 ? (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3 py-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Aucun lampadaire hors service. Excellent !
                </div>
              ) : (
                priorityIssues.map((lamp) => (
                  <button
                    type="button"
                    key={lamp.id}
                    className="flex w-full items-center justify-between rounded-lg border border-rose-100 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-2 text-left transition hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={() => {
                      setSelectedLampId(lamp.id);
                      mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">{lamp.label}</p>
                      <p className="text-xs text-muted-foreground">{lamp.street}</p>
                    </div>
                    <Badge variant="outline" className="border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-400 shrink-0">
                      HS
                    </Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Health score */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Santé du réseau
              </CardTitle>
              <CardDescription>Indicateurs en temps réel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Big score */}
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${healthColor}`}>
                  {stats.healthScore}
                  <span className="text-base font-normal text-muted-foreground">/100</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Score de santé</p>
                  <p className="text-xs text-muted-foreground">LED + disponibilité</p>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Disponibilité réseau</span>
                    <span className="font-medium">{stats.operationalRate.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={stats.operationalRate} color="bg-blue-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Couverture LED</span>
                    <span className="font-medium">{stats.ledRate.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={stats.ledRate} color="bg-emerald-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Score vert global</span>
                    <span className="font-medium">{stats.healthScore}/100</span>
                  </div>
                  <ProgressBar value={stats.healthScore} color={healthBarColor} />
                </div>
              </div>

              {/* CO₂ pill */}
              <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 px-3 py-2 flex items-center gap-2 text-xs text-teal-800 dark:text-teal-300">
                <Wind className="h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="font-semibold">
                    {stats.savedKgCo2 >= 1000
                      ? `${(stats.savedKgCo2 / 1000).toFixed(1)} t`
                      : `${Math.round(stats.savedKgCo2)} kg`}
                  </span>{' '}
                  CO₂ évités / an grâce aux LED
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
