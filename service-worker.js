
// Define cache names for versioning
const STATIC_CACHE_NAME = 'club-of-competition-static-v18';
const DYNAMIC_CACHE_NAME = 'club-of-competition-dynamic-v3';

// List of assets to be cached on installation (App Shell)
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
  '/utils/errors.ts',
  '/App.tsx',
  // Components
  '/components/ActivityHistory.tsx',
  '/components/AdmitCardTracker.tsx',
  '/components/AiResumeBuilder.tsx',
  '/components/ApplicationTracker.tsx',
  '/components/AskAiAnything.tsx',
  '/components/Button.tsx',
  '/components/Card.tsx',
  '/components/CareerCompass.tsx',
  '/components/ConceptLinkMap.tsx',
  '/components/ContentRenderer.tsx',
  '/components/CurrentAffairsAnalyst.tsx',
  '/components/DailyBriefing.tsx',
  '/components/Dashboard.tsx',
  '/components/DictionaryPopup.tsx',
  '/components/DisplaySettingsPopup.tsx',
  '/components/DoubtSolver.tsx',
  '/components/ErrorMessage.tsx',
  '/components/ExamDetailsViewer.tsx',
  '/components/ExamSelectionWizard.tsx',
  '/components/FlashcardsGenerator.tsx',
  '/components/GuessPaperGenerator.tsx',
  '/components/Header.tsx',
  '/components/HomeworkSolver.tsx',
  '/components/IndiaMap.tsx',
  '/components/Input.tsx',
  '/components/JobNotificationsViewer.tsx',
  '/components/LearningTracker.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/LoginPrompt.tsx',
  '/components/MindMapGenerator.tsx',
  '/components/MobileTaskbar.tsx',
  '/components/MockInterview.tsx',
  '/components/NotificationBanner.tsx',
  '/components/PopupSelector.tsx',
  '/components/PreviousYearQuestions.tsx',
  '/components/Quiz.tsx',
  '/components/QuizGenerator.tsx',
  '/components/RealLifeExamples.tsx',
  '/components/ResultTracker.tsx',
  '/components/ScientificCalculator.tsx',
  '/components/SelectionPopup.tsx',
  '/components/SelfSummaryChallenge.tsx',
  '/components/Sidebar.tsx',
  '/components/StartupLoading.tsx',
  '/components/StatusTracker.tsx',
  '/components/StudyMaterialModal.tsx',
  '/components/StudyPlanner.tsx',
  '/components/SyllabusTracker.tsx',
  '/components/TeachBackMode.tsx',
  '/components/TeachShortcuts.tsx',
  '/components/Tools.tsx',
  '/components/TopicExplorer.tsx',
  '/components/TopicSearchTool.tsx',
  '/components/UserProfile.tsx',
  '/components/WorldPoliticalMap.tsx',
  '/components/AdminDashboard.tsx',
  // Charts
  '/components/charts/BarChart.tsx',
  '/components/charts/PieChart.tsx',
  // Diagrams
  '/components/diagrams/CycleDiagram.tsx',
  '/components/diagrams/HierarchyDiagram.tsx',
  '/components/diagrams/ProcessDiagram.tsx',
  '/components/diagrams/PyramidDiagram.tsx',
  '/components/diagrams/ShapeDiagram.tsx',
  '/components/diagrams/VennDiagram.tsx',
  // Icons
  '/components/icons/ArrowRightOnRectangleIcon.tsx',
  '/components/icons/ArrowsRightLeftIcon.tsx',
  '/components/icons/Bars3Icon.tsx',
  '/components/icons/BeakerIcon.tsx',
  '/components/icons/BookOpenIcon.tsx',
  '/components/icons/ChartBarIcon.tsx',
  '/components/icons/CheckCircleIcon.tsx',
  '/components/icons/ClipboardListIcon.tsx',
  '/components/icons/ClockIcon.tsx',
  '/components/icons/Cog6ToothIcon.tsx',
  '/components/icons/ExclamationTriangleIcon.tsx',
  '/components/icons/GlobeAltIcon.tsx',
  '/components/icons/GoogleIcon.tsx',
  '/components/icons/HomeIcon.tsx',
  '/components/icons/InformationCircleIcon.tsx',
  '/components/icons/LightBulbIcon.tsx',
  '/components/icons/QuestionMarkCircleIcon.tsx',
  '/components/icons/RectangleGroupIcon.tsx',
  '/components/icons/ScissorsIcon.tsx',
  '/components/icons/SparklesIcon.tsx',
  '/components/icons/UserCircleIcon.tsx',
  '/components/icons/UserGroupIcon.tsx',
  '/components/icons/WrenchScrewdriverIcon.tsx',
  // CDNs - Core
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/@google/genai@^1.25.0',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/'
];

// CDNs for heavy libraries (cached dynamically)
const CDN_URLS = [
    'cdn.jsdelivr.net',
    'unpkg.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map(assetUrl => {
            const request = new Request(assetUrl, { cache: 'reload' });
            return cache.add(request).catch(err => console.warn(`Failed to cache ${assetUrl}:`, err));
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy: Stale-while-revalidate for CDNs and APIs
  // This ensures fast loading from cache while updating in background
  if (url.hostname.includes('googleapis.com') || CDN_URLS.some(cdn => url.hostname.includes(cdn))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // Network failure - if we have no cache, return error
            // If we have cache, the cachedResponse will be returned below
            console.warn('Fetch failed for', event.request.url, err);
        });

        return cachedResponse || fetchPromise;
      })
    );
  } else { 
    // Strategy: Cache First for App Shell
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
  }
});
