export {};

declare module 'leaflet.markercluster' {
  const content: unknown;
  export default content;
}

declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    showCoverageOnHover?: boolean;
    iconCreateFunction?: (cluster: any) => DivIcon;
    disableClusteringAtZoom?: number;
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    removeOutsideVisibleBounds?: boolean;
  }

  interface MarkerClusterGroup extends FeatureGroup {
    zoomToShowLayer(layer: Layer, callback?: () => void): void;
    getChildCount(): number;
    getAllChildMarkers(): Marker[];
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
