import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import mapReducer from './slices/mapSlice';
import uiReducer from './slices/ui/index';
import dataReducer from './slices/data/index';
import analyticsReducer from './slices/analytics/index';
import userReducer from './slices/user/index';
import gisToolsReducer from './slices/gisToolsSlice';

// Custom sessionStorage for redux-persist (auto-clears on browser close)
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

/**
 * Dynamic storage adapter for redux-persist
 * - When "Keep me signed in" is active → uses localStorage (survives browser close)
 * - Otherwise → uses sessionStorage (cleared on browser close)
 */
const createDynamicStorage = () => {
  if (typeof window === 'undefined') return createNoopStorage();
  
  return {
    getItem(key: string): Promise<string | null> {
      // Check localStorage first (persistent sessions), then sessionStorage
      const localValue = localStorage.getItem(key);
      const sessionValue = sessionStorage.getItem(key);
      return Promise.resolve(localValue || sessionValue);
    },
    setItem(key: string, value: string): Promise<string> {
      const rememberMe = localStorage.getItem('opti_remember_me') === 'true';
      if (rememberMe) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
      }
      return Promise.resolve(value);
    },
    removeItem(key: string): Promise<void> {
      // Clear from both to ensure clean state
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      return Promise.resolve();
    },
  };
};

const storage = createDynamicStorage();

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist auth state
  blacklist: ['map', 'ui'], // Don't persist map instance or UI state
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  map: mapReducer,
  ui: uiReducer,
  data: dataReducer,
  analytics: analyticsReducer,
  user: userReducer,
  gisTools: gisToolsReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'map/setMapInstance'
        ],
        ignoredPaths: ['map.mapInstance'],
      },
    }),
  devTools: false, // Completely disable DevTools to stop "Receiving end does not exist" logs
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

