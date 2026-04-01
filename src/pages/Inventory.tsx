import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLampPosts } from '@/context/LampContext';
import { LAMP_STATUS_LABELS, LAMP_STATUS_COLORS } from '@/types/lamp.types';
import type { LampStatus } from '@/types/lamp.types';
import { Leaf, Lightbulb, Wrench, Zap } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { calcAnnualKwhForLamp } from '@/utils/energy';

const STATUS_BORDER: Record<LampStatus, string> = {
  led:     'border-l-emerald-500',
  classic: 'border-l-lime-500',
  out:     'border-l-rose-500',
};

const STATUS_ICON: Record<LampStatus, React.ElementType> = {
  led:     Leaf,
  classic: Lightbulb,
  out:     Wrench,
};

const STATUS_ICON_COLOR: Record<LampStatus, string> = {
  led:     'text-emerald-600',
  classic: 'text-lime-600',
  out:     'text-rose-600',
};

interface ProgressBarProps { value: number; max?: number; color?: string; }
const ProgressBar = ({ value, max = 100, color = 'bg-emerald-500' }: ProgressBarProps) => (
  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
    <div
      className={`h-full rounded-full transition-all ${color}`}
      style={{ width: `${Math.min(100, (value / max) * 100).toFixed(1)}%` }}
    />
  </div>
);

export const Inventory = () => {
  const { lampPosts, updateLampStatus } = useLampPosts();
  const { settings } = useSettings();
  const { hoursPerNight, ledPower, classicPower, co2Factor } = settings;
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LampStatus>('all');

  const summary = useMemo(() => {
    const total = lampPosts.length;
    const led = lampPosts.filter((l) => l.status === 'led').length;
    const classic = lampPosts.filter((l) => l.status === 'classic').length;
    const out = lampPosts.filter((l) => l.status === 'out').length;
    return { total, led, classic, out };
  }, [lampPosts]);

  const filtered = useMemo(() => {
    return lampPosts.filter((lamp) => {
      const q = query.toLowerCase();
      const matchQuery =
        lamp.label.toLowerCase().includes(q) ||
        lamp.street.toLowerCase().includes(q) ||
        lamp.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || lamp.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [lampPosts, query, statusFilter]);

  const powerForStatus = (status: LampStatus): number =>
    status === 'led' ? ledPower : status === 'classic' ? classicPower : 0;

  const annualKwhForLamp = (status: LampStatus) =>
    calcAnnualKwhForLamp(powerForStatus(status), hoursPerNight);

  const co2ForLamp = (status: LampStatus) => annualKwhForLamp(status) * co2Factor;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Inventaire</h1>
        <p className="text-muted-foreground mt-2">
          Parc complet des lampadaires avec recherche, filtres et mise à jour rapide.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'led' ? 'all' : 'led')}
          className={`text-left rounded-xl border-2 transition-all px-4 py-3 ${
            statusFilter === 'led'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
              : 'border-transparent bg-card hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">LED</span>
            <Leaf className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400">{summary.led}</p>
          <div className="mt-2">
            <ProgressBar value={(summary.led / summary.total) * 100} color="bg-emerald-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {((summary.led / summary.total) * 100).toFixed(0)}% du parc — basse consommation
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'classic' ? 'all' : 'classic')}
          className={`text-left rounded-xl border-2 transition-all px-4 py-3 ${
            statusFilter === 'classic'
              ? 'border-lime-500 bg-lime-50 dark:bg-lime-950/30'
              : 'border-transparent bg-card hover:border-lime-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Classique</span>
            <Lightbulb className="h-4 w-4 text-lime-600" />
          </div>
          <p className="text-2xl font-semibold text-lime-700 dark:text-lime-400">{summary.classic}</p>
          <div className="mt-2">
            <ProgressBar value={(summary.classic / summary.total) * 100} color="bg-lime-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {((summary.classic / summary.total) * 100).toFixed(0)}% du parc — en transition
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
          className={`text-left rounded-xl border-2 transition-all px-4 py-3 ${
            statusFilter === 'out'
              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
              : 'border-transparent bg-card hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hors service</span>
            <Wrench className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-semibold text-rose-700 dark:text-rose-400">{summary.out}</p>
          <div className="mt-2">
            <ProgressBar value={(summary.out / summary.total) * 100} color="bg-rose-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {((summary.out / summary.total) * 100).toFixed(0)}% — taux d'anomalie
          </p>
        </button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filtres rapides</CardTitle>
          <CardDescription>Recherchez par identifiant, rue ou statut. Cliquez les cartes ci-dessus pour filtrer par type.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Rechercher (LP-0001, Rue de la Gare…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="md:max-w-sm"
          />
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:w-56"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | LampStatus)}
          >
            <option value="all">Tous les statuts</option>
            <option value="led">Fonctionnel - LED</option>
            <option value="classic">Fonctionnel - classique</option>
            <option value="out">Hors service</option>
          </select>
          <Button
            variant="outline"
            onClick={() => { setQuery(''); setStatusFilter('all'); }}
          >
            Réinitialiser
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} / {summary.total} lampadaires
          </span>
        </CardContent>
      </Card>

      {/* Lamp list */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Liste des lampadaires</CardTitle>
          <CardDescription>Cliquez sur le menu pour changer l'état d'un lampadaire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucun lampadaire ne correspond aux filtres.
            </p>
          ) : (
            filtered.map((lamp) => {
              const Icon = STATUS_ICON[lamp.status];
              const annualKwh = annualKwhForLamp(lamp.status);
              const kgCo2 = co2ForLamp(lamp.status);

              return (
                <div
                  key={lamp.id}
                  className={`flex flex-col gap-3 rounded-xl border border-l-4 bg-card px-4 py-3 md:flex-row md:items-center md:justify-between transition-shadow hover:shadow-sm ${STATUS_BORDER[lamp.status]}`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 shrink-0 ${STATUS_ICON_COLOR[lamp.status]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{lamp.id}</span>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: LAMP_STATUS_COLORS[lamp.status],
                            color: LAMP_STATUS_COLORS[lamp.status],
                          }}
                        >
                          {LAMP_STATUS_LABELS[lamp.status]}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm mt-0.5">{lamp.label}</p>
                      <p className="text-xs text-muted-foreground">{lamp.street}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    {/* Energy info */}
                    {lamp.status !== 'out' && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5">
                        <Zap className="h-3 w-3" />
                        <span className="tabular-nums">
                          {powerForStatus(lamp.status)} W · {annualKwh.toFixed(0)} kWh/an · {kgCo2.toFixed(1)} kg CO₂
                        </span>
                      </div>
                    )}
                    {lamp.status === 'out' && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-lg px-2.5 py-1.5">
                        <Wrench className="h-3 w-3" />
                        <span>Intervention requise</span>
                      </div>
                    )}

                    <select
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                      value={lamp.status}
                      onChange={(e) => updateLampStatus(lamp.id, e.target.value as LampStatus)}
                    >
                      <option value="led">LED</option>
                      <option value="classic">Classique</option>
                      <option value="out">HS</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};
