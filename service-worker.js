// Define cache names for versioning
const STATIC_CACHE_NAME = 'govprep-ai-static-v2';
const DYNAMIC_CACHE_NAME = 'govprep-ai-dynamic-v2';

// List of assets to be cached on installation
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/metadata.json',
  '/types.ts',
  '/constants.ts',
  '/services/geminiService.ts',
  '/components/icons/AcademicCapIcon.tsx',
  '/components/icons/ArrowPathIcon.tsx',
  '/components/icons/BookOpenIcon.tsx',
  '/components/icons/CalendarDaysIcon.tsx',
  '/components/icons/ChartBarIcon.tsx',
  '/components/icons/CheckBadgeIcon.tsx',
  '/components/icons/CheckCircleIcon.tsx',
  '/components/icons/ClipboardCheckIcon.tsx',
  '/components/icons/ClipboardListIcon.tsx',
  '/components/icons/DocumentTextIcon.tsx',
  '/components/icons/GlobeAltIcon.tsx',
  '/components/icons/InformationCircleIcon.tsx',
  '/components/icons/KeyIcon.tsx',
  '/components/icons/SparklesIcon.tsx',
  '/components/icons/TrophyIcon.tsx',
  '/components/icons/UserGroupIcon.tsx',
  '/components/icons/XCircleIcon.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/Card.tsx',
  '/components/Button.tsx',
  '/components/Select.tsx',
  '/components/Quiz.tsx',
  '/components/QuizGenerator.tsx',
  '/components/StudyHelper.tsx',
  '/components/MockInterview.tsx',
  '/App.tsx',
  '/components/TopicExplorer.tsx',
  '/utils/tracking.ts',
  '/components/LearningTracker.tsx',
  '/components/SyllabusTracker.tsx',
  '/components/StatusTracker.tsx',
  '/components/ResultTracker.tsx',
  '/components/AdmitCardTracker.tsx',
  '/components/ApplicationTracker.tsx',
  '/components/DailyBriefing.tsx',
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/@google/genai@^1.16.0',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/'
];

// Install event: open a cache and add the assets to it
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pre-caching App Shell');
      // Use addAll with a new Request object that bypasses the cache to ensure fresh resources on install
      const cachePromises = ASSETS_TO_CACHE.map(assetUrl => {
          const request = new Request(assetUrl, { cache: 'reload' });
          return cache.add(request);
      });
      return Promise.all(cachePromises);
    })
  );
});

// Activate event: clean up old caches
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

// Fetch event: serve assets from cache or network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy: Network first, then cache for Gemini API calls
  if (url.hostname.includes('googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If response is valid, clone it and store in the dynamic cache
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request.url, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to get the response from the cache
          return caches.match(event.request.url);
        })
    );
  } else {
    // Strategy: Cache first, then network for all other requests
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
