import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Map, SlidersHorizontal, Palette, Leaf, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/context/SettingsContext';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { settings, saveSettings } = useSettings();

  // Carte
  const [defaultZoom, setDefaultZoom] = useState(String(settings.defaultZoom));
  const [showClusters, setShowClusters] = useState(settings.showClusters);

  // Énergie
  const [hoursPerNight, setHoursPerNight] = useState(String(settings.hoursPerNight));
  const [ledPower, setLedPower] = useState(String(settings.ledPower));
  const [classicPower, setClassicPower] = useState(String(settings.classicPower));

  // Éco
  const [kwhPrice, setKwhPrice] = useState(String(settings.kwhPrice));
  const [co2Factor, setCo2Factor] = useState(String(settings.co2Factor));
  const [ledTargetPct, setLedTargetPct] = useState(String(settings.ledTargetPct));

  const parseNum = (value: string, min: number, max: number): number | null => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max) return null;
    return n;
  };

  const handleSaveMap = () => {
    const zoom = parseNum(defaultZoom, 11, 18);
    if (zoom === null) {
      toast.error('Zoom invalide — valeur entre 11 et 18 requise');
      return;
    }
    saveSettings({ defaultZoom: zoom, showClusters });
    toast.success('Paramètres carte enregistrés');
  };

  const handleSaveEnergy = () => {
    const hours = parseNum(hoursPerNight, 6, 14);
    const led = parseNum(ledPower, 10, 80);
    const classic = parseNum(classicPower, 40, 200);
    const kwh = parseNum(kwhPrice, 0.05, 0.50);
    if (hours === null || led === null || classic === null || kwh === null) {
      toast.error('Valeur invalide — vérifiez les limites indiquées sur chaque champ');
      return;
    }
    saveSettings({ hoursPerNight: hours, ledPower: led, classicPower: classic, kwhPrice: kwh });
    toast.success('Hypothèses énergétiques enregistrées');
  };

  const handleSaveEco = () => {
    const co2 = parseNum(co2Factor, 0.01, 0.5);
    const target = parseNum(ledTargetPct, 50, 100);
    if (co2 === null || target === null) {
      toast.error('Valeur invalide — vérifiez les limites indiquées sur chaque champ');
      return;
    }
    saveSettings({ co2Factor: co2, ledTargetPct: target });
    toast.success('Objectifs écologiques enregistrés');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Configurez la carte, les hypothèses énergétiques et les objectifs écologiques.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Carte */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Paramètres carte
            </CardTitle>
            <CardDescription>Configuration de l'expérience cartographique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-zoom">Zoom initial (11 – 18)</Label>
              <Input
                id="default-zoom"
                type="number"
                min="11"
                max="18"
                value={defaultZoom}
                onChange={(e) => setDefaultZoom(e.target.value)}
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
                className="h-4 w-4 accent-emerald-600"
                checked={showClusters}
                onChange={(e) => setShowClusters(e.target.checked)}
              />
            </div>
            <Separator />
            <Button onClick={handleSaveMap}>Enregistrer</Button>
          </CardContent>
        </Card>

        {/* Hypothèses énergétiques */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Hypothèses énergétiques
            </CardTitle>
            <CardDescription>
              Valeurs utilisées pour les calculs de consommation et de coûts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hours">Heures d'éclairage / nuit</Label>
                <Input
                  id="hours"
                  type="number"
                  min="6"
                  max="14"
                  value={hoursPerNight}
                  onChange={(e) => setHoursPerNight(e.target.value)}
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
                  onChange={(e) => setLedPower(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classic-power">Puissance classique (W)</Label>
                <Input
                  id="classic-power"
                  type="number"
                  min="40"
                  max="200"
                  value={classicPower}
                  onChange={(e) => setClassicPower(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kwh-price">Prix du kWh (€)</Label>
                <Input
                  id="kwh-price"
                  type="number"
                  step="0.01"
                  min="0.05"
                  max="0.50"
                  value={kwhPrice}
                  onChange={(e) => setKwhPrice(e.target.value)}
                />
              </div>
            </div>
            <Separator />
            <Button onClick={handleSaveEnergy}>Mettre à jour</Button>
          </CardContent>
        </Card>

        {/* Paramètres écologiques */}
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600" />
              Objectifs écologiques
            </CardTitle>
            <CardDescription>
              Paramètres utilisés pour le score vert, les émissions CO₂ et les objectifs de transition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="co2-factor">
                  Facteur CO₂ réseau (kg/kWh)
                  <span className="ml-1 text-xs text-muted-foreground">ADEME 2023</span>
                </Label>
                <Input
                  id="co2-factor"
                  type="number"
                  step="0.001"
                  min="0.01"
                  max="0.5"
                  value={co2Factor}
                  onChange={(e) => setCo2Factor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="led-target">
                  Objectif taux LED (%)
                  <span className="ml-1 text-xs text-muted-foreground">pour 2026</span>
                </Label>
                <Input
                  id="led-target"
                  type="number"
                  min="50"
                  max="100"
                  value={ledTargetPct}
                  onChange={(e) => setLedTargetPct(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 px-3 py-3 flex gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Ces valeurs alimentent le <strong>score vert</strong>, les tonnes de CO₂ évitées et
                la barre de progression LED affichées sur le tableau de bord et la page Coûts.
              </span>
            </div>

            <Separator />
            <Button onClick={handleSaveEco}>Enregistrer les objectifs</Button>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Apparence
            </CardTitle>
            <CardDescription>Thème et style de l'application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-3">
              <div>
                <p className="text-sm font-medium">Thème clair / sombre</p>
                <p className="text-xs text-muted-foreground">Bascule de la palette globale</p>
              </div>
              <Button variant="outline" onClick={toggleTheme}>
                Actuel : {theme === 'dark' ? 'Sombre' : 'Clair'}
              </Button>
            </div>

            <div className="rounded-lg bg-muted/40 px-3 py-3 text-xs text-muted-foreground flex gap-2">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Le thème sombre réduit la consommation des écrans OLED. Une petite contribution
                écologique supplémentaire.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
