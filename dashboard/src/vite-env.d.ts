/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REFRESH_INTERVAL?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
