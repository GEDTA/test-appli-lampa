import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLampPosts } from '@/context/LampContext';
import { LAMP_STATUS_LABELS, LAMP_STATUS_COLORS } from '@/types/lamp.types';
import type { LampStatus } from '@/types/lamp.types';

export const Inventory = () => {
  const { lampPosts, updateLampStatus } = useLampPosts();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LampStatus>('all');

  const filtered = useMemo(() => {
    return lampPosts.filter((lamp) => {
      const matchQuery =
        lamp.label.toLowerCase().includes(query.toLowerCase()) ||
        lamp.street.toLowerCase().includes(query.toLowerCase()) ||
        lamp.id.toLowerCase().includes(query.toLowerCase());
      const matchStatus = statusFilter === 'all' ? true : lamp.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [lampPosts, query, statusFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Inventaire</h1>
        <p className="text-muted-foreground mt-2">
          Parc complet des lampadaires avec recherche et mise à jour rapide.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filtres rapides</CardTitle>
          <CardDescription>Recherchez par identifiant, rue ou statut</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder="Rechercher (LP-0001, Rue de la Gare...)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="md:max-w-sm"
          />
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:w-56"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | LampStatus)}
          >
            <option value="all">Tous les statuts</option>
            <option value="led">Fonctionnel - LED</option>
            <option value="classic">Fonctionnel - classique</option>
            <option value="out">Hors service</option>
          </select>
          <Button variant="outline" onClick={() => { setQuery(''); setStatusFilter('all'); }}>
            Réinitialiser
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Liste des lampadaires ({filtered.length})</CardTitle>
          <CardDescription>Mise à jour rapide de l'état</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun lampadaire ne correspond aux filtres.</p>
          ) : (
            filtered.map((lamp) => (
              <div
                key={lamp.id}
                className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm text-muted-foreground">{lamp.id}</p>
                  <p className="font-medium">{lamp.label}</p>
                  <p className="text-xs text-muted-foreground">{lamp.street}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    style={{ borderColor: LAMP_STATUS_COLORS[lamp.status], color: LAMP_STATUS_COLORS[lamp.status] }}
                  >
                    {LAMP_STATUS_LABELS[lamp.status]}
                  </Badge>
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={lamp.status}
                    onChange={(event) => updateLampStatus(lamp.id, event.target.value as LampStatus)}
                  >
                    <option value="led">LED</option>
                    <option value="classic">Classique</option>
                    <option value="out">HS</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
