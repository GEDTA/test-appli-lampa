import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import { MarkerClusterGroup } from '@/components/map/MarkerClusterGroup';
import L from 'leaflet';
import 'leaflet.markercluster';
import { LAMP_STATUS_LABELS } from '@/types/lamp.types';
import type { LampPost, LampStatus } from '@/types/lamp.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const createLampIcon = (status: LampStatus) =>
  L.divIcon({
    html: `<span class="lamp-marker lamp-marker--${status}"></span>`,
    className: 'lamp-marker-wrapper',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const createAddIcon = () =>
  L.divIcon({
    html: `<span class="lamp-marker lamp-marker--add"></span>`,
    className: 'lamp-marker-wrapper',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const statusRank: Record<LampStatus, number> = {
  led: 1,
  classic: 2,
  out: 3,
};

const getWorstStatus = (cluster: any): LampStatus => {
  const markers = cluster.getAllChildMarkers?.() ?? [];
  let worst: LampStatus = 'led';
  markers.forEach((marker: any) => {
    const iconHtml = marker?.options?.icon?.options?.html ?? '';
    const match = String(iconHtml).match(/lamp-marker--(led|classic|out)/);
    if (match && statusRank[match[1] as LampStatus] > statusRank[worst]) {
      worst = match[1] as LampStatus;
    }
  });
  return worst;
};

const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 'sm' : count < 40 ? 'md' : 'lg';
  const worst = getWorstStatus(cluster);
  const leaf = worst === 'led' ? '<span class="lamp-cluster-leaf">🍃</span>' : '';
  return L.divIcon({
    html: `<div class="lamp-cluster lamp-cluster--${size} lamp-cluster--${worst}">${count}${leaf}</div>`,
    className: 'lamp-cluster-wrapper',
    iconSize: [44, 44],
  });
};

interface PendingLamp {
  lat: number;
  lng: number;
}

interface LampMapProps {
  lampPosts: LampPost[];
  onUpdateStatus: (id: string, status: LampStatus) => Promise<void>;
  onAddLamp?: (data: { street: string; lat: number; lng: number; status: LampStatus }) => Promise<unknown>;
  selectedLampId?: string | null;
  center?: [number, number];
  defaultZoom?: number;
  showClusters?: boolean;
}

// ---- Popup contenu lampadaire existant ----
const LampPopupContent = ({
  lamp,
  onUpdateStatus,
}: {
  lamp: LampPost;
  onUpdateStatus: (id: string, status: LampStatus) => Promise<void>;
}) => {
  const [status, setStatus] = useState<LampStatus>(lamp.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setStatus(lamp.status); }, [lamp.status]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateStatus(lamp.id, status);
    } catch {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 text-foreground">
      <div>
        <p className="text-sm text-muted-foreground">{lamp.id}</p>
        <p className="font-semibold text-foreground">{lamp.label}</p>
        <p className="text-sm text-muted-foreground">{lamp.street}</p>
      </div>
      <Badge variant="outline">{LAMP_STATUS_LABELS[lamp.status]}</Badge>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Mettre à jour l'état</label>
        <select
          className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as LampStatus)}
        >
          <option value="led">Fonctionnel - LED</option>
          <option value="classic">Fonctionnel - classique</option>
          <option value="out">Hors service</option>
        </select>
      </div>
      <Button size="sm" className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? 'Enregistrement…' : 'Valider la modification'}
      </Button>
      <p className="text-xs text-muted-foreground">
        MàJ : {new Date(lamp.lastUpdated).toLocaleDateString('fr-FR')}
      </p>
    </div>
  );
};

// ---- Popup ajout nouveau lampadaire ----
const AddLampPopupContent = ({
  lat,
  lng,
  onConfirm,
  onCancel,
}: {
  lat: number;
  lng: number;
  onConfirm: (street: string, status: LampStatus) => Promise<void>;
  onCancel: () => void;
}) => {
  const [street, setStreet] = useState('');
  const [status, setStatus] = useState<LampStatus>('classic');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!street.trim()) return;
    setSaving(true);
    try {
      await onConfirm(street.trim(), status);
    } catch {
      toast.error("Erreur lors de l'ajout du lampadaire");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 min-w-[220px] text-foreground">
      <div>
        <p className="font-semibold text-emerald-700 dark:text-emerald-400">Nouveau lampadaire</p>
        <p className="text-xs text-muted-foreground">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Nom de rue *</label>
        <input
          autoFocus
          className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Rue du Moulin…"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">État initial</label>
        <select
          className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as LampStatus)}
        >
          <option value="led">Fonctionnel - LED</option>
          <option value="classic">Fonctionnel - classique</option>
          <option value="out">Hors service</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={handleConfirm}
          disabled={!street.trim() || saving}
        >
          {saving ? '…' : 'Ajouter'}
        </Button>
      </div>
    </div>
  );
};

// ---- Écouteur de clics sur la carte ----
const MapClickHandler = ({
  addMode,
  onMapClick,
}: {
  addMode: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    map.getContainer().style.cursor = addMode ? 'crosshair' : '';
  }, [addMode, map]);

  useMapEvents({
    click(e) {
      if (addMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
};

// ---- Bouton mode ajout (dans le MapContainer) ----
const AddModeButton = ({
  addMode,
  onToggle,
}: {
  addMode: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: '10px', marginLeft: '10px' }}>
      <div className="leaflet-control">
        <button
          type="button"
          onClick={onToggle}
          title={addMode ? 'Annuler l\'ajout' : 'Ajouter un lampadaire'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: addMode ? '#059669' : '#fff',
            color: addMode ? '#fff' : '#374151',
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 1px 5px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          {addMode
            ? <><X size={14} /> Annuler</>
            : <><Plus size={14} /> Ajouter un lampadaire</>
          }
        </button>
      </div>
    </div>
  );
};

// ---- Focus sur lampadaire sélectionné ----
const LampMapFocus = ({
  selectedLampId,
  lampPosts,
  markersRef,
  clusterRef,
}: {
  selectedLampId?: string | null;
  lampPosts: LampPost[];
  markersRef: React.MutableRefObject<Record<string, L.Marker>>;
  clusterRef: React.MutableRefObject<any>;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedLampId) return;
    const lamp = lampPosts.find((item) => item.id === selectedLampId);
    if (!lamp) return;
    const marker = markersRef.current[selectedLampId];
    if (!marker) {
      map.setView([lamp.lat, lamp.lng], Math.max(map.getZoom(), 17), { animate: true });
      return;
    }
    const focus = () => {
      map.setView(marker.getLatLng(), Math.max(map.getZoom(), 17), { animate: true });
      marker.openPopup();
    };
    const cluster = clusterRef.current;
    if (cluster && typeof cluster.zoomToShowLayer === 'function') {
      cluster.zoomToShowLayer(marker, focus);
      return;
    }
    focus();
  }, [selectedLampId, lampPosts, map, markersRef, clusterRef]);

  return null;
};

// ---- Composant principal ----
export const LampMap = ({
  lampPosts,
  onUpdateStatus,
  onAddLamp,
  selectedLampId,
  center: centerProp,
  defaultZoom = 14,
  showClusters = true,
}: LampMapProps) => {
  const center = useMemo(
    () => centerProp ?? ([48.6579, 7.8307] as [number, number]),
    [centerProp]
  );
  const markersRef = useRef<Record<string, L.Marker>>({});
  const clusterRef = useRef<any>(null);
  const addMarkerRef = useRef<L.Marker | null>(null);

  const [addMode, setAddMode] = useState(false);
  const [pendingLamp, setPendingLamp] = useState<PendingLamp | null>(null);

  const icons = useMemo(
    () => ({
      led: createLampIcon('led'),
      classic: createLampIcon('classic'),
      out: createLampIcon('out'),
      add: createAddIcon(),
    }),
    []
  );

  const handleMapClick = (lat: number, lng: number) => {
    setPendingLamp({ lat, lng });
  };

  const handleConfirmAdd = async (street: string, status: LampStatus) => {
    if (!pendingLamp || !onAddLamp) return;
    await onAddLamp({ street, lat: pendingLamp.lat, lng: pendingLamp.lng, status });
    setPendingLamp(null);
    setAddMode(false);
  };

  const handleCancelAdd = () => {
    setPendingLamp(null);
    setAddMode(false);
  };

  return (
    <MapContainer
      center={center}
      zoom={defaultZoom}
      minZoom={11}
      maxZoom={21}
      zoomControl={false}
      className="h-[420px] w-full rounded-2xl overflow-hidden md:h-[520px]"
    >
      <MapClickHandler addMode={addMode} onMapClick={handleMapClick} />
      <LampMapFocus
        selectedLampId={selectedLampId}
        lampPosts={lampPosts}
        markersRef={markersRef}
        clusterRef={clusterRef}
      />
      {onAddLamp && <AddModeButton addMode={addMode} onToggle={() => { setAddMode((v) => !v); setPendingLamp(null); }} />}
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxNativeZoom={19}
        maxZoom={21}
      />

      {/* Marqueur temporaire d'ajout */}
      {pendingLamp && (
        <Marker
          position={[pendingLamp.lat, pendingLamp.lng]}
          icon={icons.add}
          ref={(ref) => { addMarkerRef.current = ref; }}
        >
          <Popup
            className="lamp-popup"
            minWidth={240}
            maxWidth={280}
            autoPan
            closeButton={false}
            autoClose={false}
            closeOnClick={false}
          >
            <AddLampPopupContent
              lat={pendingLamp.lat}
              lng={pendingLamp.lng}
              onConfirm={handleConfirmAdd}
              onCancel={handleCancelAdd}
            />
          </Popup>
        </Marker>
      )}

      {/* Marqueurs existants */}
      {showClusters ? (
        <MarkerClusterGroup
          ref={clusterRef}
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          showCoverageOnHover={false}
          disableClusteringAtZoom={18}
        >
          {lampPosts.map((lamp) => (
            <Marker
              key={lamp.id}
              position={[lamp.lat, lamp.lng]}
              icon={icons[lamp.status]}
              title={lamp.id}
              ref={(ref) => {
                if (ref) markersRef.current[lamp.id] = ref;
              }}
            >
              <Popup className="lamp-popup" minWidth={220} maxWidth={260}>
                <LampPopupContent lamp={lamp} onUpdateStatus={onUpdateStatus} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      ) : (
        <>
          {lampPosts.map((lamp) => (
            <Marker
              key={lamp.id}
              position={[lamp.lat, lamp.lng]}
              icon={icons[lamp.status]}
              title={lamp.id}
              ref={(ref) => {
                if (ref) markersRef.current[lamp.id] = ref;
              }}
            >
              <Popup className="lamp-popup" minWidth={220} maxWidth={260}>
                <LampPopupContent lamp={lamp} onUpdateStatus={onUpdateStatus} />
              </Popup>
            </Marker>
          ))}
        </>
      )}
    </MapContainer>
  );
};
