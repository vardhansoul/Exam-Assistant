import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import itemsRaw from '../data/mapLearningItems.json';
import Card from './Card';
import Button from './Button';
import { ChevronRight, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { generateMapLearningItems } from '../services/geminiService';
import ErrorMessage from './ErrorMessage';

// Fix leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultItems = itemsRaw as any[];

const ClickHandler = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

export default function MapInteractiveLearning({ onSetBackHandler, isOnline, selectionPath, language, topics }: any) {
  const [items, setItems] = useState<any[]>(defaultItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'learning' | 'practice' | 'quiz' | 'feedback'>('learning');
  const [clickedPos, setClickedPos] = useState<L.LatLng | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const fetchDynamicItems = async () => {
    if (!isOnline || !selectionPath || selectionPath === 'No Exam Selected') {
        setItems(defaultItems);
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
        const topicTheme = topics && topics.length > 0 ? topics[Math.floor(Math.random() * topics.length)] : selectionPath;
        const dynamicItems = await generateMapLearningItems(topicTheme, language || 'English');
        if (dynamicItems && dynamicItems.length > 0) {
            setItems(dynamicItems);
            setCurrentIndex(0);
        } else {
            // Fallback
            setItems(defaultItems);
        }
    } catch (err: any) {
        console.error("Failed to fetch map items:", err);
        setError("Failed to generate dynamic map challenges. Using default modules.");
        setItems(defaultItems);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamicItems();
  }, [selectionPath, language, isOnline]);

  const currentItem = items[currentIndex];

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPhase('learning');
      setClickedPos(null);
      setIsCorrect(null);
    } else {
      // Finished
      setCurrentIndex(0);
      setPhase('learning');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleMapClick = (latlng: L.LatLng) => {
    if (phase !== 'quiz') return;
    setClickedPos(latlng);
    
    if (currentItem.quiz.answer_type === 'point' && currentItem.quiz.lat && currentItem.quiz.lng) {
      const dist = calculateDistance(latlng.lat, latlng.lng, currentItem.quiz.lat, currentItem.quiz.lng);
      setIsCorrect(dist <= (currentItem.quiz.tolerance_km || 100));
    } else {
      // Polygon approximation for simple interactive map
      setIsCorrect(true);
      alert(`For region ${currentItem.quiz.answer_name || 'this location'}, assuming click inside boundary is correct for now.`);
    }
    setPhase('feedback');
  };

  if (!isOnline) {
    return <Card><p className="p-6 text-center text-gray-500">Map loading requires an internet connection.</p></Card>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center"><MapPin className="mr-2 text-blue-600" /> Map Pointer Challenge</h2>
        {!isLoading && items.length > 0 && <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{currentIndex + 1} / {items.length}</span>}
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDynamicItems} />}

      {isLoading ? (
        <Card className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300">Generating dynamic smart map challenges using AI for {selectionPath}...</p>
        </Card>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <h3 className="text-lg font-bold mb-2">{currentItem?.title || 'Unknown Location'}</h3>
            <div className="inline-block px-2 py-1 text-xs font-semibold uppercase tracking-wide bg-blue-100 text-blue-800 rounded mb-4">
              {currentItem?.type || 'general'}
            </div>

            {phase === 'learning' && currentItem && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</h4>
                  <p className="mt-1">{currentItem.learning?.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Key Fact</h4>
                  <p className="mt-1 font-medium">{currentItem.learning?.fact}</p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button className="w-full" onClick={() => setPhase('practice')}>Practice Now <ChevronRight className="ml-2 w-4 h-4" /></Button>
                </div>
              </div>
            )}

            {phase === 'practice' && currentItem && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <p className="text-lg font-medium text-blue-600 dark:text-blue-400">{currentItem.practice?.task}</p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800/50">
                  <span className="font-semibold text-yellow-800 dark:text-yellow-500">Hint:</span> {currentItem.learning?.hint}
                </div>
                <Button className="w-full" onClick={() => setPhase('quiz')}>Start Map Quiz</Button>
                <Button variant="outline" className="w-full" onClick={() => setPhase('learning')}>Back to Learning</Button>
              </div>
            )}

            {phase === 'quiz' && currentItem && (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                <p className="text-lg font-bold animate-pulse text-indigo-600 dark:text-indigo-400">{currentItem.quiz?.question}</p>
                <p className="text-sm text-gray-500">Click on the map to submit your answer.</p>
              </div>
            )}

            {phase === 'feedback' && currentItem && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className={`p-4 rounded-xl flex items-start gap-3 ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100' : 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100'}`}>
                  {isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 shrink-0" /> : <XCircle className="w-6 h-6 text-red-600 mt-1 shrink-0" />}
                  <div>
                    <h4 className="font-bold text-lg">{isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                    <p className="mt-1 opacity-90">{isCorrect ? currentItem.feedback?.correct : currentItem.feedback?.wrong}</p>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={handleNext}>Next Question <ChevronRight className="ml-2 w-4 h-4" /></Button>
              </div>
            )}
            
            {!currentItem && (
                <p className="text-slate-500">No items available.</p>
            )}
          </Card>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-2 h-[500px] lg:h-[600px] overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-800 relative shadow-inner group z-0">
          <MapContainer 
            center={[22.5937, 78.9629]} 
            zoom={4} 
            scrollWheelZoom={true} 
            className="w-full h-full cursor-crosshair"
            zoomControl={false}
            style={{ zIndex: 0 }}
          >
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
                      attribution='Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, USGS, NASA'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                  />
              </LayersControl.BaseLayer>
            </LayersControl>
            {phase === 'quiz' && <ClickHandler onMapClick={handleMapClick} />}
            {clickedPos && phase === 'feedback' && (
              <Marker position={clickedPos}>
                <Popup>You clicked here!</Popup>
              </Marker>
            )}
            {/* Show target if wrong point answer */}
            {phase === 'feedback' && !isCorrect && currentItem?.quiz?.answer_type === 'point' && currentItem?.quiz?.lat && (
              <Marker position={[currentItem.quiz.lat, currentItem.quiz.lng]}>
                 <Popup>Actual Location: {currentItem.title}</Popup>
              </Marker>
            )}
          </MapContainer>
          
          {phase === 'quiz' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-indigo-100 dark:border-indigo-900 z-[1000] animate-bounce pointer-events-none">
              <span className="font-bold text-indigo-700 dark:text-indigo-400">Click a location on the map!</span>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
