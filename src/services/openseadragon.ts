import OpenSeadragon, { Options, Viewer, TiledImage, Rect } from 'openseadragon'
import { getAuthenticationToken } from '@/services'
import { defaultAuthCondition } from '@/util/imageAuth'
import { getAuthHeaders } from '@/util/auth'

export { Viewer, Rect, TiledImage }

/** Taken from openseadragon index.d.ts. Doesn't have a name. */
interface ThingWithLevels {
  type: string
  levels: Array<{
    url: string
    height: number
    width: number
  }>
}

/** Taken from openseadragon index.d.ts. Doesn't have a name. */
interface ImageContainer {
  Image: {
    xmlns?: string | undefined
    Url: string
    Format: string
    Overlap: string
    TileSize: string
    Size: {
      Width: string
      Height: string
    }
  }
}

const isImageContainer = (value: any): value is ImageContainer => value?.Image?.Url != null

const isThingWithLevels = (value: any): value is ThingWithLevels =>
  value?.levels != null &&
  (value as ThingWithLevels).levels.every(item => typeof item.url === 'string')

export const isAuthRequired = (tileSources: Options['tileSources']) => {
  if (typeof tileSources === 'string') {
    return defaultAuthCondition(tileSources)
  } else if (isThingWithLevels(tileSources)) {
    return tileSources.levels.some(item => defaultAuthCondition(item.url))
  } else if (isImageContainer(tileSources)) {
    return defaultAuthCondition(tileSources.Image.Url)
  }
  return false
}

export const getAuthOptions = (): Pick<
  Options,
  'loadTilesWithAjax' | 'ajaxHeaders' | 'ajaxWithCredentials'
> => {
  const token = getAuthenticationToken()
  return token != null
    ? {
        loadTilesWithAjax: true,
        ajaxHeaders: getAuthHeaders(token),
        ajaxWithCredentials: true
      }
    : {}
}

/**
 * A wrapper around OpenSeadragon that handles authentication.
 */
export const createOpenSeadragon = (options: Options) => {
  const authRequired = isAuthRequired(options.tileSources)

  return OpenSeadragon({
    ...options,
    ...(authRequired ? getAuthOptions() : {})
  })
}
