import { createLayerComponent } from '@react-leaflet/core';
import type { LeafletContextInterface } from '@react-leaflet/core';
import L, { MarkerClusterGroupOptions } from 'leaflet';
import 'leaflet.markercluster';

export type MarkerClusterProps = MarkerClusterGroupOptions & {
  iconCreateFunction?: (cluster: any) => L.DivIcon;
  chunkedLoading?: boolean;
  showCoverageOnHover?: boolean;
};

const createMarkerClusterGroup = (props: MarkerClusterProps, context: LeafletContextInterface) => {
  const clusterGroup = L.markerClusterGroup({
    chunkedLoading: props.chunkedLoading,
    showCoverageOnHover: props.showCoverageOnHover,
    iconCreateFunction: props.iconCreateFunction,
  });

  return {
    instance: clusterGroup,
    context: { ...context, layerContainer: clusterGroup },
  };
};

export const MarkerClusterGroup = createLayerComponent<
  L.MarkerClusterGroup,
  MarkerClusterProps
>(createMarkerClusterGroup);
