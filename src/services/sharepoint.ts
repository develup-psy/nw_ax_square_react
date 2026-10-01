export type AxSquarePost = {
  id: number
  title: string
  section: 'INFORMATION' | 'NOTICE' | 'INSIGHT' | 'HOT_NOTICE' | string
  tag: string
  summary: string
  href: string
  publishedAt: string
  sortOrder: number
  isFeatured: boolean
  isVisible: boolean
  contentImage: string
}

type SharePointItem = Record<string, unknown>

function inferSharePointSiteUrl() {
  const configured = (import.meta.env.VITE_SHAREPOINT_SITE_URL as string | undefined)?.trim()
  if (configured) return configured.replace(/\/$/, '')

  const { origin, pathname } = window.location
  const sitePath = pathname.match(/^\/(sites|teams)\/[^/]+/i)?.[0]
  return sitePath ? `${origin}${sitePath}` : origin
}

function valueOf(item: SharePointItem, ...keys: string[]) {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) return item[key]
  }
  return undefined
}

function asString(value: unknown) {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

function asBoolean(value: unknown, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  const normalized = String(value).toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

function asNumber(value: unknown, fallback = 9999) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Hyperlink / SharePoint Image JSON / 일반 URL 문자열을 모두 URL로 정규화합니다.
 */
function normalizeUrl(value: unknown) {
  if (!value) return ''

  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>
    if (objectValue.serverUrl && objectValue.serverRelativeUrl) {
      return `${asString(objectValue.serverUrl)}${asString(objectValue.serverRelativeUrl)}`
    }
    return asString(objectValue.Url ?? objectValue.url ?? objectValue.serverRelativeUrl ?? objectValue.serverUrl)
  }

  const raw = asString(value)
  if (!raw) return ''

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed.serverUrl && parsed.serverRelativeUrl) {
      return `${asString(parsed.serverUrl)}${asString(parsed.serverRelativeUrl)}`
    }
    return asString(parsed.Url ?? parsed.url ?? parsed.serverRelativeUrl) || raw
  } catch {
    return raw
  }
}

async function fetchListItems(listName: string): Promise<SharePointItem[]> {
  const siteUrl = inferSharePointSiteUrl()
  const escapedListName = listName.replace(/'/g, "''")
  const url = `${siteUrl}/_api/web/lists/getbytitle('${escapedListName}')/items?$top=5000`

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json;odata=nometadata' },
  })

  if (!response.ok) {
    throw new Error(`SharePoint list load failed: ${listName} (${response.status})`)
  }

  const data = (await response.json()) as { value?: SharePointItem[]; d?: { results?: SharePointItem[] } }
  return data.value ?? data.d?.results ?? []
}

const REACT_TEST_POSTS: AxSquarePost[] = [
  {
    id: -9001,
    title: '운영스퀘어 주요 공지 예시',
    section: 'HOT_NOTICE',
    tag: '필독',
    summary: '',
    href: '',
    publishedAt: '2026-09-01T09:00:00+09:00',
    sortOrder: 1,
    isFeatured: true,
    isVisible: true,
    contentImage: '',
  },
  {
    id: -9002,
    title: 'Posting Builder 오픈 안내 예시',
    section: 'HOT_NOTICE',
    tag: '업데이트',
    summary: '',
    href: '',
    publishedAt: '2026-08-31T09:00:00+09:00',
    sortOrder: 2,
    isFeatured: true,
    isVisible: true,
    contentImage: '',
  },
]

function mapItems(items: SharePointItem[]): AxSquarePost[] {
  return items
    .map(item => ({
      id: asNumber(valueOf(item, 'Id', 'ID'), 0),
      title: asString(valueOf(item, 'Title', 'title')),
      section: asString(valueOf(item, 'section', 'Section')).toUpperCase(),
      tag: asString(valueOf(item, 'tag', 'Tag')),
      summary: asString(valueOf(item, 'summary', 'Summary')),
      href: normalizeUrl(valueOf(item, 'href', 'Href', 'URL', 'Url')),
      publishedAt: asString(valueOf(item, 'published_at', 'PublishedAt')),
      sortOrder: asNumber(valueOf(item, 'sort_order', 'SortOrder')),
      isFeatured: asBoolean(valueOf(item, 'is_featured', 'IsFeatured'), false),
      isVisible: asBoolean(valueOf(item, 'is_visible', 'IsVisible'), true),
      contentImage: normalizeUrl(valueOf(item, 'content_image', 'ContentImage')),
    }))
    .filter(item => item.isVisible)
}

export async function fetchAxSquarePosts(): Promise<AxSquarePost[]> {
  try {
    const items = await fetchListItems('ax_square_posts')
    return mapItems(items)
  } catch (error) {
    // localhost React 검증에서는 SharePoint REST에 접근할 수 없으므로 HOT_NOTICE UI 검증용 데이터만 제공합니다.
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.info('[NW AX 운영스퀘어] React 테스트용 HOT_NOTICE mock을 사용합니다.')
      return REACT_TEST_POSTS
    }
    throw error
  }
}
