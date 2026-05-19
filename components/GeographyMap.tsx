import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface MapData {
    center: [number, number];
    zoom: number;
    markers?: { lat: number; lng: number; label?: string }[];
    circles?: { lat: number; lng: number; radius: number; color?: string; label?: string }[];
    lines?: { coordinates: [number, number][]; color?: string; label?: string }[];
    polygons?: { coordinates: [number, number][]; color?: string; label?: string }[];
    description?: string;
}

// Component to handle dynamic map resizing and view updates
const MapUpdater: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
        
        // Wait a few frames for transitions/layout to settle then invalidate size
        const timeout = setTimeout(() => {
            map.invalidateSize();
        }, 200);
        
        return () => clearTimeout(timeout);
    }, [center, zoom, map]);
    return null;
};

export const GeographyMap: React.FC<{ data: MapData }> = ({ data }) => {
    const defaultCenter: [number, number] = [20.5937, 78.9629];
    const center = data.center || defaultCenter;
    const zoom = data.zoom || 5;

    return (
        <div className="my-6 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-md">
            <div className="h-80 sm:h-96 w-full relative z-0">
                <MapContainer 
                    center={center} 
                    zoom={zoom} 
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                    <MapUpdater center={center} zoom={zoom} />
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Political & District Boundaries (OSM)">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Mountain Ranges & Physical (OpenTopo)">
                            <TileLayer
                                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Terrain & Rivers (Esri NatGeo)">
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>
                    
                    {data.markers?.map((marker, idx) => (
                        <Marker key={`marker-${idx}`} position={[marker.lat, marker.lng]}>
                            {marker.label && <Popup>{marker.label}</Popup>}
                        </Marker>
                    ))}

                    {data.circles?.map((circle, idx) => (
                        <Circle 
                            key={`circle-${idx}`} 
                            center={[circle.lat, circle.lng]} 
                            radius={circle.radius} 
                            pathOptions={{ color: circle.color || 'red', fillColor: circle.color || 'red' }}
                        >
                            {circle.label && <Popup>{circle.label}</Popup>}
                        </Circle>
                    ))}

                    {data.lines?.map((line, idx) => (
                        <Polyline 
                            key={`line-${idx}`} 
                            positions={line.coordinates} 
                            pathOptions={{ color: line.color || 'blue', weight: 4 }}
                        >
                            {line.label && <Popup>{line.label}</Popup>}
                        </Polyline>
                    ))}

                    {data.polygons?.map((polygon, idx) => (
                        <Polygon 
                            key={`polygon-${idx}`} 
                            positions={polygon.coordinates} 
                            pathOptions={{ color: polygon.color || 'green', fillColor: polygon.color || 'green', fillOpacity: 0.4 }}
                        >
                            {polygon.label && <Popup>{polygon.label}</Popup>}
                        </Polygon>
                    ))}
                </MapContainer>
            </div>
            {data.description && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700">
                    🌍 <strong>Map Insight:</strong> {data.description}
                </div>
            )}
        </div>
    );
};
