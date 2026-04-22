import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSignalements } from '@/context/SignalementContext';
import {
  SIGNALEMENT_TYPE_LABELS,
  SIGNALEMENT_TYPE_COLORS,
  SIGNALEMENT_STATUS_LABELS,
  SIGNALEMENT_STATUS_COLORS,
} from '@/types/signalement.types';
import type { SignalementType, SignalementStatus } from '@/types/signalement.types';
import {
  AlertTriangle, CheckCircle2, Clock, MapPin, MessageSquare,
  RotateCcw, Lightbulb, Zap, Bell, ShieldCheck, ShieldX, Ban,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Helpers ────────────────────────────────────────────────────────────────────

const relativeDate = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return 'Hier';
  return `Il y a ${Math.floor(diff / 86400)} j`;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

// ── Stat card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  count: number;
  total: number;
  icon: React.ElementType;
  colorClass: string;
  active: boolean;
  onClick: () => void;
}

const StatCard = ({ label, count, total, icon: Icon, colorClass, active, onClick }: StatCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left rounded-xl border-2 transition-all px-4 py-3 ${
      active ? `border-current ${colorClass} opacity-100` : 'border-transparent bg-card hover:border-muted-foreground/20'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <Icon className={`h-4 w-4 ${active ? '' : 'text-muted-foreground'}`} />
    </div>
    <p className="text-2xl font-semibold">{count}</p>
    <p className="text-xs text-muted-foreground mt-1">
      {total > 0 ? `${((count / total) * 100).toFixed(0)}% du total` : '—'}
    </p>
  </button>
);

// ── Signalement item ───────────────────────────────────────────────────────────

interface SignalementItemProps {
  s: {
    id: number;
    lampPostId?: string;
    type: SignalementType;
    description?: string;
    lat: number;
    lng: number;
    status: SignalementStatus;
    createdAt: string;
    resolvedAt?: string;
  };
  onUpdateStatus: (id: number, status: SignalementStatus) => Promise<void>;
  onConfirm: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}

const SignalementItem = ({ s, onUpdateStatus, onConfirm, onReject }: SignalementItemProps) => {
  const [busy, setBusy] = useState(false);

  const handle = async (fn: () => Promise<void>, successMsg: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(successMsg);
    } catch {
      toast.error('Une erreur est survenue.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`rounded-xl border bg-card transition-shadow hover:shadow-sm ${
      s.status === 'rejete' ? 'opacity-50' : ''
    }`}>
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-start md:justify-between">
        {/* Left: info */}
        <div className="flex gap-3 min-w-0">
          <div className="mt-0.5 shrink-0">
            {s.type === 'panne'       && <Zap           className="h-4 w-4 text-rose-500" />}
            {s.type === 'anomalie'    && <AlertTriangle className="h-4 w-4 text-amber-500" />}
            {s.type === 'mal_eclaire' && <Lightbulb     className="h-4 w-4 text-blue-500" />}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">#{s.id}</span>
              <Badge className={`text-xs font-normal ${SIGNALEMENT_TYPE_COLORS[s.type]}`}>
                {SIGNALEMENT_TYPE_LABELS[s.type]}
              </Badge>
              {s.lampPostId && (
                <span className="flex items-center gap-1 text-xs font-medium text-foreground bg-muted/60 rounded px-1.5 py-0.5">
                  <MapPin className="h-3 w-3" />
                  {s.lampPostId}
                </span>
              )}
            </div>

            {s.description && (
              <p className="text-sm text-foreground flex gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                {s.description}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {relativeDate(s.createdAt)} · {fmt(s.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
              </span>
              {s.resolvedAt && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Résolu le {fmt(s.resolvedAt)}
                </span>
              )}
            </div>

            {/* Info contextuelle selon le statut */}
            {s.status === 'confirme' && s.lampPostId && (
              <div className="flex items-center gap-1.5 text-xs text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded-lg px-2.5 py-1.5 w-fit">
                <AlertTriangle className="h-3 w-3" />
                Lampadaire {s.lampPostId} marqué <strong>HS</strong> sur la carte
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="shrink-0 flex flex-col items-end gap-2 min-w-[160px]">
          {/* Badge statut */}
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${SIGNALEMENT_STATUS_COLORS[s.status]}`}>
            {SIGNALEMENT_STATUS_LABELS[s.status]}
          </span>

          {/* Actions selon statut */}
          {s.status === 'nouveau' && (
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                className="flex-1 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30 text-xs"
                onClick={() =>
                  handle(
                    () => onConfirm(s.id),
                    s.lampPostId
                      ? `Panne confirmée — ${s.lampPostId} passé en HS sur la carte`
                      : 'Signalement confirmé'
                  )
                }
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Confirmer
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                className="flex-1 gap-1.5 border-slate-300 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800/30 text-xs"
                onClick={() =>
                  handle(() => onReject(s.id), 'Signalement rejeté (spam)')
                }
              >
                <ShieldX className="h-3.5 w-3.5" />
                Rejeter
              </Button>
            </div>
          )}

          {s.status === 'confirme' && (
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                disabled={busy}
                className="flex-1 gap-1.5 text-xs bg-amber-600 hover:bg-amber-700"
                onClick={() =>
                  handle(() => onUpdateStatus(s.id, 'en_cours'), 'Intervention démarrée')
                }
              >
                <Clock className="h-3.5 w-3.5" />
                Démarrer
              </Button>
            </div>
          )}

          {s.status === 'en_cours' && (
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                disabled={busy}
                className="flex-1 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                onClick={() =>
                  handle(() => onUpdateStatus(s.id, 'resolu'), 'Signalement résolu')
                }
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Résolu
              </Button>
            </div>
          )}

          {s.status === 'resolu' && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Traité
            </span>
          )}

          {s.status === 'rejete' && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Ban className="h-3.5 w-3.5" />
              Spam écarté
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page principale ────────────────────────────────────────────────────────────

export const Signalements = () => {
  const { signalements, updateStatus, confirmSignalement, rejectSignalement } = useSignalements();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | SignalementType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SignalementStatus>('all');

  const stats = useMemo(() => {
    const total = signalements.length;
    const nouveau  = signalements.filter((s) => s.status === 'nouveau').length;
    const en_cours = signalements.filter((s) => s.status === 'confirme' || s.status === 'en_cours').length;
    const resolu   = signalements.filter((s) => s.status === 'resolu').length;
    const rejete   = signalements.filter((s) => s.status === 'rejete').length;
    return { total, nouveau, en_cours, resolu, rejete };
  }, [signalements]);

  const filtered = useMemo(() => {
    return signalements
      .filter((s) => {
        const q = query.toLowerCase();
        const matchQuery =
          !q ||
          s.lampPostId?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          String(s.id).includes(q) ||
          SIGNALEMENT_TYPE_LABELS[s.type].toLowerCase().includes(q);
        const matchType   = typeFilter === 'all' || s.type === typeFilter;
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchQuery && matchType && matchStatus;
      })
      .sort((a, b) => {
        // Priorité : nouveau > confirme > en_cours > resolu > rejete
        const order: Record<SignalementStatus, number> = {
          nouveau: 0, confirme: 1, en_cours: 2, resolu: 3, rejete: 4,
        };
        const diff = order[a.status] - order[b.status];
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [signalements, query, typeFilter, statusFilter]);

  const hasActiveFilter = query !== '' || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400 w-fit">
          <Bell className="h-3 w-3" />
          Remontées citoyennes
          {stats.nouveau > 0 && (
            <span className="ml-1 rounded-full bg-rose-600 text-white px-1.5 py-0 text-xs font-bold">
              {stats.nouveau}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Signalements</h1>
        <p className="text-muted-foreground max-w-2xl">
          Anomalies signalées par les citoyens. Vérifiez chaque remontée avant de la confirmer —
          la confirmation passe automatiquement le lampadaire concerné en <strong>Hors service</strong> sur la carte.
        </p>
      </div>

      {/* Alert si nouveaux */}
      {stats.nouveau > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">{stats.nouveau} signalement{stats.nouveau > 1 ? 's' : ''}</span>
            {' '}en attente de vérification. Confirmez ou rejetez chaque remontée.
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="À vérifier"
          count={stats.nouveau}
          total={stats.total}
          icon={Bell}
          colorClass="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
          active={statusFilter === 'nouveau'}
          onClick={() => setStatusFilter(statusFilter === 'nouveau' ? 'all' : 'nouveau')}
        />
        <StatCard
          label="En traitement"
          count={stats.en_cours}
          total={stats.total}
          icon={Clock}
          colorClass="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
          active={statusFilter === 'confirme' || statusFilter === 'en_cours'}
          onClick={() => setStatusFilter(statusFilter === 'confirme' ? 'all' : 'confirme')}
        />
        <StatCard
          label="Résolus"
          count={stats.resolu}
          total={stats.total}
          icon={CheckCircle2}
          colorClass="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
          active={statusFilter === 'resolu'}
          onClick={() => setStatusFilter(statusFilter === 'resolu' ? 'all' : 'resolu')}
        />
        <StatCard
          label="Rejetés"
          count={stats.rejete}
          total={stats.total}
          icon={Ban}
          colorClass="bg-slate-100 text-slate-500 dark:bg-slate-800/30 dark:text-slate-400"
          active={statusFilter === 'rejete'}
          onClick={() => setStatusFilter(statusFilter === 'rejete' ? 'all' : 'rejete')}
        />
      </div>

      {/* Explication du flux */}
      <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Flux de vérification :</strong>{' '}
          Nouveau → <strong>Confirmer</strong> (le lampadaire passe en HS sur la carte) ou <strong>Rejeter</strong> (spam) →
          Démarrer l'intervention → Résolu
        </span>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Recherche par ID, lampadaire ou description. Cliquez les cartes ci-dessus pour filtrer par statut.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Rechercher (#12, LP-0034, câble…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm w-44"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | SignalementType)}
          >
            <option value="all">Tous les types</option>
            <option value="panne">Panne</option>
            <option value="anomalie">Anomalie</option>
            <option value="mal_eclaire">Mal éclairé</option>
          </select>
          {hasActiveFilter && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => { setQuery(''); setTypeFilter('all'); setStatusFilter('all'); }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Réinitialiser
            </Button>
          )}
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} / {stats.total} signalement{stats.total > 1 ? 's' : ''}
          </span>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Liste des signalements</CardTitle>
          <CardDescription>
            Priorité : à vérifier en premier, puis confirmés, puis en cours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          {filtered.length === 0 ? (
            <div className="rounded-lg bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Aucun signalement pour ces critères.
            </div>
          ) : (
            filtered.map((s) => (
              <SignalementItem
                key={s.id}
                s={s}
                onUpdateStatus={updateStatus}
                onConfirm={confirmSignalement}
                onReject={rejectSignalement}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
