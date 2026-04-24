// Physical sidereal rotation period from body-metadata (23.93447117430703 h).
export const EARTH_SURFACE_ANGULAR_VELOCITY_RAD_PER_SEC =
  (2 * Math.PI) / (23.93447117430703 * 3600)

// Keep the clouds linked to Earth's spin with a small additional prograde drift.
export const EARTH_CLOUD_RELATIVE_ROTATION_FACTOR = 0.0625
export const EARTH_CLOUD_ANGULAR_VELOCITY_RAD_PER_SEC =
  EARTH_SURFACE_ANGULAR_VELOCITY_RAD_PER_SEC * (1 + EARTH_CLOUD_RELATIVE_ROTATION_FACTOR)

// UV shift per simulation-second (radians → fraction of full circle).
export const EARTH_CLOUD_UV_SPEED =
  EARTH_CLOUD_ANGULAR_VELOCITY_RAD_PER_SEC / (2 * Math.PI)

export const EARTH_CLOUD_SHADOW_SHELL_RADIUS = 1.018
