import { createLayerComponent } from '@react-leaflet/core';
import type { LeafletContextInterface } from '@react-leaflet/core';
import type { ReactNode } from 'react';
import L from 'leaflet';
import type { MarkerClusterGroupOptions } from 'leaflet';
import 'leaflet.markercluster';

export type MarkerClusterProps = MarkerClusterGroupOptions & {
  iconCreateFunction?: (cluster: any) => L.DivIcon;
  chunkedLoading?: boolean;
  showCoverageOnHover?: boolean;
  children?: ReactNode;
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
