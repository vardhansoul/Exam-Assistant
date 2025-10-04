// Define cache names for versioning
const STATIC_CACHE_NAME = 'club-of-competition-static-v4';
const DYNAMIC_CACHE_NAME = 'club-of-competition-dynamic-v1';

// List of assets to be cached on installation
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/metadata.json',
  '/types.ts',
  '/constants.ts',
  '/firebase.ts',
  '/services/geminiService.ts',
  '/utils/tracking.ts',
  '/App.tsx',
  // Components
  '/components/AdmitCardTracker.tsx',
  '/components/ApplicationTracker.tsx',
  '/components/Button.tsx',
  '/components/Card.tsx',
  '/components/CurrentAffairsAnalyst.tsx',
  '/components/DailyBriefing.tsx',
  '/components/DoubtSolver.tsx',
  '/components/ExamDetailsViewer.tsx',
  '/components/GuessPaperGenerator.tsx',
  '/components/Input.tsx',
  '/components/JobNotificationsViewer.tsx',
  '/components/LearningTracker.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/MindMapGenerator.tsx',
  '/components/MockInterview.tsx',
  '/components/PopupSelector.tsx',
  '/components/Quiz.tsx',
  '/components/QuizGenerator.tsx',
  '/components/ResultTracker.tsx',
  '/components/SelectionPopup.tsx',
  '/components/StatusTracker.tsx',
  '/components/StoryTutor.tsx',
  '/components/StudyHelper.tsx',
  '/components/StudyPlanner.tsx',
  '/components/SyllabusTracker.tsx',
  '/components/TeachShortcuts.tsx',
  '/components/TopicExplorer.tsx',
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
            // Use 'reload' to bypass HTTP cache and ensure we get the latest version from the network.
            const request = new Request(assetUrl, { cache: 'reload' });
            return cache.add(request).catch(err => console.warn(`Failed to cache ${assetUrl}:`, err));
        })
      );
    })
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
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

  // Network-first for API calls, then cache fallback
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
        .catch(() => caches.match(event.request.url).then(res => res || Promise.reject('No cache match')))
    );
  } else { // Cache-first for local assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then(fetchRes => {
          // Optionally, cache new assets dynamically
          return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request.url, fetchRes.clone());
            return fetchRes;
          });
        });
      })
    );
  }
});