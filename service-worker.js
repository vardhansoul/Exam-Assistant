
// Define cache names for versioning
const STATIC_CACHE_NAME = 'govprep-ai-static-v3';
const DYNAMIC_CACHE_NAME = 'govprep-ai-dynamic-v3';

// List of assets to be cached on installation
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/metadata.json',
  '/types.ts',
  '/constants.ts',
  '/services/geminiService.ts',
  '/utils/tracking.ts',
  '/App.tsx',
  // Components
  '/components/LoadingSpinner.tsx',
  '/components/Card.tsx',
  '/components/Button.tsx',
  '/components/Select.tsx',
  '/components/TopicExplorer.tsx',
  '/components/MockInterview.tsx',
  '/components/MindMapGenerator.tsx',
  '/components/GuessPaperGenerator.tsx',
  '/components/LearningTracker.tsx',
  '/components/SyllabusTracker.tsx',
  '/components/StatusTracker.tsx',
  '/components/ResultTracker.tsx',
  '/components/AdmitCardTracker.tsx',
  '/components/ApplicationTracker.tsx',
  '/components/CurrentAffairsAnalyst.tsx',
  // New Icons
  '/components/icons/AcademicCapIcon.tsx',
  '/components/icons/ArrowLeftIcon.tsx',
  '/components/icons/ArrowPathIcon.tsx',
  '/components/icons/Bars3Icon.tsx',
  '/components/icons/BeakerIcon.tsx',
  '/components/icons/BookOpenIcon.tsx',
  '/components/icons/CalendarDaysIcon.tsx',
  '/components/icons/ChartPieIcon.tsx',
  '/components/icons/CheckBadgeIcon.tsx',
  '/components/icons/ChevronDownIcon.tsx',
  '/components/icons/ChevronRightIcon.tsx',
  '/components/icons/ClipboardCheckIcon.tsx',
  '/components/icons/ClipboardListIcon.tsx',
  '/components/icons/ClockIcon.tsx',
  '/components/icons/DocumentSparklesIcon.tsx',
  '/components/icons/ExclamationTriangleIcon.tsx',
  '/components/icons/FireIcon.tsx',
  '/components/icons/GlobeAltIcon.tsx',
  '/components/icons/HomeIcon.tsx',
  '/components/icons/InformationCircleIcon.tsx',
  '/components/icons/KeyIcon.tsx',
  '/components/icons/PaperAirplaneIcon.tsx',
  '/components/icons/RectangleGroupIcon.tsx',
  '/components/icons/TrashIcon.tsx',
  '/components/icons/TrendingUpIcon.tsx',
  '/components/icons/TrophyIcon.tsx',
  '/components/icons/UserGroupIcon.tsx',
  '/components/icons/XMarkIcon.tsx',
  // CDNs
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/@google/genai@^1.16.0',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return Promise.all(
        ASSETS_TO_CACHE.map(assetUrl => {
            const request = new Request(assetUrl, { cache: 'reload' });
            return cache.add(request).catch(err => console.warn(`Failed to cache ${assetUrl}:`, err));
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname.includes('googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request.url, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(event.request.url))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
