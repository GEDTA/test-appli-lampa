import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Map, SlidersHorizontal, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [hoursPerNight, setHoursPerNight] = useState('10');
  const [ledPower, setLedPower] = useState('30');
  const [classicPower, setClassicPower] = useState('80');
  const [defaultZoom, setDefaultZoom] = useState('13');
  const [showClusters, setShowClusters] = useState(true);

  const handleSave = () => {
    toast.success('Paramètres enregistrés');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Ajustez les paramètres de la carte et les hypothèses énergétiques.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Paramètres carte
            </CardTitle>
            <CardDescription>Configuration de l’expérience cartographique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-zoom">Zoom initial</Label>
              <Input
                id="default-zoom"
                type="number"
                min="11"
                max="18"
                value={defaultZoom}
                onChange={(event) => setDefaultZoom(event.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
              <div>
                <p className="text-sm font-medium">Clustering automatique</p>
                <p className="text-xs text-muted-foreground">
                  Regroupement par zones pour faciliter la lecture
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={showClusters}
                onChange={(event) => setShowClusters(event.target.checked)}
              />
            </div>
            <Separator />
            <Button onClick={handleSave}>Enregistrer</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Hypothèses énergétiques
            </CardTitle>
            <CardDescription>Valeurs utilisées pour les estimations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hours">Heures / nuit</Label>
                <Input
                  id="hours"
                  type="number"
                  min="6"
                  max="14"
                  value={hoursPerNight}
                  onChange={(event) => setHoursPerNight(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="led-power">Puissance LED (W)</Label>
                <Input
                  id="led-power"
                  type="number"
                  min="10"
                  max="80"
                  value={ledPower}
                  onChange={(event) => setLedPower(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classic-power">Puissance classique (W)</Label>
                <Input
                  id="classic-power"
                  type="number"
                  min="40"
                  max="120"
                  value={classicPower}
                  onChange={(event) => setClassicPower(event.target.value)}
                />
              </div>
            </div>
            <Separator />
            <Button onClick={handleSave}>Mettre à jour</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Apparence
          </CardTitle>
          <CardDescription>Thème et style de l'application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
            <div>
              <p className="text-sm font-medium">Thème clair / sombre</p>
              <p className="text-xs text-muted-foreground">Bascule de la palette globale</p>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              Actuel : {theme === 'dark' ? 'Sombre' : 'Clair'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
