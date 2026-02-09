import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LampMap } from '@/components/map/LampMap';
import { LAMP_STATUS_COLORS, LAMP_STATUS_LABELS } from '@/types/lamp.types';
import type { LampStatus } from '@/types/lamp.types';
import { AlertTriangle, Leaf, Lightbulb, MapPin } from 'lucide-react';
import { useLampPosts } from '@/context/LampContext';

export const Dashboard = () => {
  const { lampPosts, updateLampStatus } = useLampPosts();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selectedLampId, setSelectedLampId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = lampPosts.length;
    const led = lampPosts.filter((lamp) => lamp.status === 'led').length;
    const classic = lampPosts.filter((lamp) => lamp.status === 'classic').length;
    const out = lampPosts.filter((lamp) => lamp.status === 'out').length;

    return {
      total,
      led,
      classic,
      out,
      functional: total - out,
      ledRate: total > 0 ? Math.round((led / total) * 100) : 0,
    };
  }, [lampPosts]);

  const handleUpdateStatus = (id: string, status: LampStatus) => {
    updateLampStatus(id, status);
  };

  const priorityIssues = lampPosts
    .filter((lamp) => lamp.status === 'out')
    .sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          Suivi des lampadaires - Wolfisheim
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Carte intelligente des lampadaires</h1>
        <p className="text-muted-foreground max-w-2xl">
          Visualisez l'état du parc lumineux, identifiez rapidement les anomalies et mettez à jour
          les informations directement sur la carte.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lampadaires LED</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.led}</div>
            <p className="text-xs text-muted-foreground">Soit {stats.ledRate}% du parc</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-lime-50 via-white to-white shadow-sm dark:from-lime-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lampadaires classiques</CardTitle>
            <Lightbulb className="h-4 w-4 text-lime-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.classic}</div>
            <p className="text-xs text-muted-foreground">Éclairage traditionnel</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 via-white to-white shadow-sm dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hors service</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.out}</div>
            <p className="text-xs text-muted-foreground">Interventions prioritaires</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-white shadow-sm dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total géré</CardTitle>
            <MapPin className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Lampadaires suivis</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Carte dynamique</CardTitle>
            <CardDescription>
              Zoom progressif par zones, puis par rues. Cliquez sur un point pour modifier l'état.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4" ref={mapRef}>
            <LampMap
              lampPosts={lampPosts}
              onUpdateStatus={handleUpdateStatus}
              selectedLampId={selectedLampId}
            />
            {selectedLampId && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-900">
                Lampadaire sélectionné : <span className="font-semibold">{selectedLampId}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {(['led', 'classic', 'out'] as LampStatus[]).map((status) => (
                <span key={status} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: LAMP_STATUS_COLORS[status] }}
                  ></span>
                  {LAMP_STATUS_LABELS[status]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Interventions prioritaires</CardTitle>
              <CardDescription>Lampadaires HS à traiter en priorité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorityIssues.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun lampadaire signalé hors service.
                </p>
              ) : (
                priorityIssues.map((lamp) => (
                  <button
                    type="button"
                    key={lamp.id}
                    className="flex w-full items-center justify-between rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2 text-left transition hover:border-rose-200 hover:bg-rose-50"
                    onClick={() => {
                      setSelectedLampId(lamp.id);
                      mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">{lamp.label}</p>
                      <p className="text-xs text-muted-foreground">{lamp.street}</p>
                    </div>
                    <Badge variant="outline" className="border-rose-200 text-rose-700">
                      HS
                    </Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Qualité du parc</CardTitle>
              <CardDescription>Indicateurs rapides pour la mairie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Lampadaires fonctionnels</p>
                <p className="text-sm font-semibold">{stats.functional}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Taux d'anomalie</p>
                <p className="text-sm font-semibold">
                  {stats.total > 0 ? Math.round((stats.out / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">LED installées</p>
                <p className="text-sm font-semibold">{stats.led}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-muted-foreground">
                Les données présentées sont un prototype. L'intégration API permettra d'afficher
                des données temps réel.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
