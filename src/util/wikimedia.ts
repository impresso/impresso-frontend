export interface WikimediaFileUrlOptions {
  width?: number
  height?: number
}

const WIKIMEDIA_REDIRECT_FILE_BASE_URL =
  'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/'

const toPositiveInteger = (value?: number): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }
  const rounded = Math.round(value)
  return rounded > 0 ? rounded : null
}

export function getWikimediaRedirectFileUrl(
  filename: string,
  options: WikimediaFileUrlOptions = {}
): string {
  if (typeof filename !== 'string' || filename.length === 0) {
    return ''
  }

  const width = toPositiveInteger(options.width)
  const height = toPositiveInteger(options.height)
  const queryParams = new URLSearchParams()

  if (width != null) {
    queryParams.set('width', String(width))
  }
  if (height != null) {
    queryParams.set('height', String(height))
  }

  const suffix = queryParams.toString()
  const encodedFilename = encodeURIComponent(filename)
  if (!suffix) {
    return `${WIKIMEDIA_REDIRECT_FILE_BASE_URL}${encodedFilename}`
  }
  return `${WIKIMEDIA_REDIRECT_FILE_BASE_URL}${encodedFilename}&${suffix}`
}
