import { BODY_IDS, getBodyRegistryEntry, type BodyId, type BodyMetadata } from '../domain/body'

export const presentationBodyMetadata: BodyMetadata[] = BODY_IDS.map((bodyId) => {
  const registryEntry = getBodyRegistryEntry(bodyId)

  return {
    id: bodyId,
    displayName: registryEntry.displayName,
    color: registryEntry.color,
    material: registryEntry.material,
    radius: registryEntry.radius,
    defaultTrailWindowDays: registryEntry.defaultTrailWindowDays,
    trailSampleRateMultiplier: registryEntry.trailSampleRateMultiplier,
    focusOffset: [...registryEntry.focusOffset],
    hasRings: registryEntry.hasRings,
    spinInitialPhaseStrategy: registryEntry.spinInitialPhaseStrategy
  }
})

export function getPresentationBodyMetadataById(bodyId: BodyId) {
  return presentationBodyMetadata.find((body) => body.id === bodyId)
}
