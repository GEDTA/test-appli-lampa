import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { MarkerClusterGroup } from '@/components/map/MarkerClusterGroup';
import L from 'leaflet';
import 'leaflet.markercluster';
import { LAMP_STATUS_LABELS } from '@/types/lamp.types';
import type { LampPost, LampStatus } from '@/types/lamp.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface LampMapProps {
  lampPosts: LampPost[];
  onUpdateStatus: (id: string, status: LampStatus) => void;
  selectedLampId?: string | null;
}

const LampPopupContent = ({
  lamp,
  onUpdateStatus,
}: {
  lamp: LampPost;
  onUpdateStatus: (id: string, status: LampStatus) => void;
}) => {
  const [status, setStatus] = useState<LampStatus>(lamp.status);

  useEffect(() => {
    setStatus(lamp.status);
  }, [lamp.status]);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">{lamp.id}</p>
        <p className="font-semibold">{lamp.label}</p>
        <p className="text-sm text-muted-foreground">{lamp.street}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{LAMP_STATUS_LABELS[lamp.status]}</Badge>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Mettre à jour l'état
        </label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value as LampStatus)}
        >
          <option value="led">Fonctionnel - LED</option>
          <option value="classic">Fonctionnel - classique</option>
          <option value="out">Hors service</option>
        </select>
      </div>
      <Button size="sm" className="w-full" onClick={() => onUpdateStatus(lamp.id, status)}>
        Valider la modification
      </Button>
      <p className="text-xs text-muted-foreground">
        Dernière mise à jour: {new Date(lamp.lastUpdated).toLocaleDateString('fr-FR')}
      </p>
    </div>
  );
};

const LampMapFocus = ({
  selectedLampId,
  lampPosts,
  markersRef,
  clusterRef,
}: {
  selectedLampId?: string | null;
  lampPosts: LampPost[];
  markersRef: React.MutableRefObject<Record<string, L.Marker>>;
  clusterRef: React.MutableRefObject<L.MarkerClusterGroup | null>;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedLampId) return;
    const lamp = lampPosts.find((item) => item.id === selectedLampId);
    if (!lamp) return;
    const marker = markersRef.current[selectedLampId];
    if (!marker) {
      const position = L.latLng(lamp.lat, lamp.lng);
      map.setView(position, Math.max(map.getZoom(), 16), { animate: true });
      return;
    }

    const focus = () => {
      const position = marker.getLatLng();
      map.setView(position, Math.max(map.getZoom(), 16), { animate: true });
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

export const LampMap = ({ lampPosts, onUpdateStatus, selectedLampId }: LampMapProps) => {
  const center = useMemo(() => [48.5867, 7.6682] as [number, number], []);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const icons = useMemo(
    () => ({
      led: createLampIcon('led'),
      classic: createLampIcon('classic'),
      out: createLampIcon('out'),
    }),
    []
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      minZoom={12}
      maxZoom={18}
      zoomControl={false}
      className="h-[420px] w-full rounded-2xl overflow-hidden md:h-[520px]"
    >
      <LampMapFocus
        selectedLampId={selectedLampId}
        lampPosts={lampPosts}
        markersRef={markersRef}
        clusterRef={clusterRef}
      />
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup
        ref={clusterRef}
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        showCoverageOnHover={false}
      >
        {lampPosts.map((lamp) => (
          <Marker
            key={lamp.id}
            position={[lamp.lat, lamp.lng]}
            icon={icons[lamp.status]}
            title={lamp.id}
            ref={(ref) => {
              if (ref) {
                markersRef.current[lamp.id] = ref;
              }
            }}
          >
            <Popup className="lamp-popup" minWidth={220} maxWidth={260}>
              <LampPopupContent lamp={lamp} onUpdateStatus={onUpdateStatus} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};
