/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB_EPHEMERIS_BODY_METADATA_URL?: string
  readonly VITE_WEB_EPHEMERIS_DATA_BASE_URL?: string
  readonly VITE_WEB_EPHEMERIS_PROFILE?: string
  readonly VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
