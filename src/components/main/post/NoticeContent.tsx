import { ChevronIcon } from '../../icons'
import { useAxSquare } from '../../../context/AxSquareContext'
import type { AxSquarePost } from '../../../services/sharepoint'

// 전체 공지 더보기 클릭 시 이동할 Confluence 주소입니다.
const NOTICE_MORE_URL =
  'https://lgucorp.atlassian.net/wiki/spaces/yuE2EYBu1YuB'

/**
 * SharePoint NOTICE 데이터가 하나도 없을 때만
 * 디자인 확인용으로 표시되는 가데이터입니다.
 *
 * 실제 NOTICE 데이터가 1건이라도 있으면
 * 아래 데이터는 화면에 노출되지 않습니다.
 */
const MOCK_NOTICES: AxSquarePost[] = [
  {
    id: -1,
    title: '공동 운영 과제 수행 방식 변경 안내',
    section: 'NOTICE',
    tag: '필수',
    summary: '',
    href: '#',
    publishedAt: new Date().toISOString(),
    sortOrder: 1,
    isFeatured: true,
    isVisible: true,
  },
  {
    id: -2,
    title: 'Robot 운영 환경 점검 기준 및 대응 절차 안내',
    section: 'NOTICE',
    tag: '변경',
    summary: '',
    href: '#',
    publishedAt: '2026-08-31T09:00:00',
    sortOrder: 2,
    isFeatured: true,
    isVisible: true,
  },
  {
    id: -3,
    title: 'UiPath 운영 Agent 신규 버전 업데이트 안내',
    section: 'NOTICE',
    tag: '업데이트',
    summary: '',
    href: '#',
    publishedAt: new Date().toISOString(),
    sortOrder: 3,
    isFeatured: false,
    isVisible: true,
  },
  {
    id: -4,
    title: 'Python 실행 환경 오류 발생 및 조치 결과 공유',
    section: 'NOTICE',
    tag: '이슈 공유',
    summary: '',
    href: '#',
    publishedAt: '2026-08-30T14:30:00',
    sortOrder: 4,
    isFeatured: false,
    isVisible: true,
  },
  {
    id: -5,
    title: '마무리 RPA 성공 로그 작성 규칙 안내',
    section: 'NOTICE',
    tag: '규정',
    summary: '',
    href: '#',
    publishedAt: '2026-08-29T11:00:00',
    sortOrder: 5,
    isFeatured: false,
    isVisible: true,
  },
  {
    id: -6,
    title: '공동 운영 전환 전 반드시 확인해야 할 체크리스트',
    section: 'NOTICE',
    tag: '필수',
    summary: '',
    href: '#',
    publishedAt: '2026-08-28T10:00:00',
    sortOrder: 6,
    isFeatured: false,
    isVisible: true,
  },
  {
    id: -7,
    title: 'Robot PC 정기 재부팅 일정 안내',
    section: 'NOTICE',
    tag: '참고',
    summary: '',
    href: '#',
    publishedAt: '2026-08-27T09:00:00',
    sortOrder: 7,
    isFeatured: false,
    isVisible: true,
  },
  {
    id: -8,
    title: 'UiPath 표준 개발 버전 변경 안내',
    section: 'NOTICE',
    tag: '버전',
    summary: '',
    href: '#',
    publishedAt: '2026-08-26T13:00:00',
    sortOrder: 8,
    isFeatured: false,
    isVisible: true,
  },
  {
    id: -9,
    title: '운영 Agent 네이밍 컨벤션 준수 요청',
    section: 'NOTICE',
    tag: '규정',
    summary: '',
    href: '#',
    publishedAt: '2026-08-25T16:00:00',
    sortOrder: 9,
    isFeatured: false,
    isVisible: true,
  },
  {
    id: -10,
    title: 'Cloud PC 접속 오류 발생 시 확인 방법',
    section: 'NOTICE',
    tag: '참고',
    summary: '',
    href: '#',
    publishedAt: '2026-08-24T09:00:00',
    sortOrder: 10,
    isFeatured: false,
    isVisible: true,
  },
]

function formatDate(value: string) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10).replace(/-/g, '.')
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function getPublishedTime(value: string) {
  if (!value) return 0

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? 0
    : date.getTime()
}

/**
 * 게시일이 오늘인 경우에만 NEW 표시
 */
function isNewPost(value: string) {
  if (!value) return false

  const publishedAt = new Date(value)

  if (Number.isNaN(publishedAt.getTime())) {
    return false
  }

  const today = new Date()

  return (
    publishedAt.getFullYear() === today.getFullYear() &&
    publishedAt.getMonth() === today.getMonth() &&
    publishedAt.getDate() === today.getDate()
  )
}

function getTagClass(tag: string) {
  const normalized = tag.trim().toLowerCase()

  if (['업데이트', 'update'].includes(normalized)) {
    return 'notice-tag--blue'
  }

  if (['이슈 공유', '이슈', 'issue'].includes(normalized)) {
    return 'notice-tag--orange'
  }

  if (['변경', 'change'].includes(normalized)) {
    return 'notice-tag--purple'
  }

  if (['필수', 'required'].includes(normalized)) {
    return 'notice-tag--pink'
  }

  if (['버전', 'version'].includes(normalized)) {
    return 'notice-tag--green'
  }

  if (['규정', 'rule'].includes(normalized)) {
    return 'notice-tag--orange'
  }

  if (['참고', 'reference'].includes(normalized)) {
    return 'notice-tag--gray'
  }

  return 'notice-tag--pink'
}

function NoticePinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 17v5" />
      <path d="M5 17h14" />
      <path d="M6 3h12" />
      <path d="M8 3v5l-2 4h12l-2-4V3" />
    </svg>
  )
}

function SectionLabel({
  children
}: {
  children: string
}) {
  return (
    <div className="notice-section-label">
      <span className="notice-section-label-bar" />

      <span
        className="notice-section-label-text clamp-1"
        title={children}
      >
        {children}
      </span>
    </div>
  )
}

function NoticeRow({
  post
}: {
  post: AxSquarePost
}) {
  const isNew = isNewPost(post.publishedAt)

  return (
    <a
      className={
        `notice-row` +
        `${post.isFeatured ? ' notice-row--pinned' : ''}`
      }
      href={post.href || '#'}
      target={post.href === '#' ? undefined : '_blank'}
      rel={post.href === '#' ? undefined : 'noreferrer'}
      title={post.title}
      onClick={(event) => {
        // 디자인 확인용 mock 데이터는 실제 이동하지 않도록 처리
        if (post.href === '#') {
          event.preventDefault()
        }
      }}
    >
      <span className="notice-meta">
        {post.isFeatured && (
          <span
            className="notice-pin"
            title="고정 공지"
            aria-label="고정 공지"
          >
            <NoticePinIcon />
          </span>
        )}

        {post.tag && (
          <span
            className={
              `notice-tag ${getTagClass(post.tag)} clamp-1`
            }
            title={post.tag}
          >
            {post.tag}
          </span>
        )}
      </span>

     <span
  className={
    `notice-title clamp-1` +
    `${isNew ? ' notice-title--new' : ''}` +
    `${post.isFeatured ? ' notice-title--featured' : ''}`
  }
>
        {post.title}

        {isNew && (
          <span className="notice-new-label">
            NEW
          </span>
        )}
      </span>

      {post.publishedAt && (
        <span className="notice-date">
          {formatDate(post.publishedAt)}
        </span>
      )}
    </a>
  )
}

function sortNotices(
  posts: AxSquarePost[]
) {
  return [...posts].sort((a, b) => {
    /**
     * 1순위:
     * 고정 공지를 무조건 가장 위에 배치
     */
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1
    }

    /**
     * 2순위:
     * 같은 그룹에서는 최신순
     */
    return (
      getPublishedTime(b.publishedAt) -
      getPublishedTime(a.publishedAt)
    )
  })
}

export default function NoticeContent() {
  const { getPostsBySection } =
    useAxSquare()

  const sharePointNotices =
    getPostsBySection('NOTICE')

  /**
   * SharePoint 데이터가 존재하면 실제 데이터 사용
   *
   * 데이터가 하나도 없을 때만
   * MOCK_NOTICES를 사용합니다.
   */
  const sourceNotices =
    sharePointNotices.length > 0
      ? sharePointNotices
      : MOCK_NOTICES

  const notices =
    sortNotices(sourceNotices)
      .slice(0, 10)

  const leftNotices =
    notices.slice(0, 5)

  const rightNotices =
    notices.slice(5, 10)

  return (
    <div className="notice-content">
      <div className="content-section-heading">
        <span className="section-category section-category--notice">
          NOTICE
        </span>

        <h3 className="content-section-title">
          운영 변경사항과 개발 관련 공지를 확인하세요
        </h3>
      </div>

      <div className="notice-grid notice-grid--single">
        <div className="notice-board">
          <div className="notice-board-header">
            <SectionLabel>
              공지사항
            </SectionLabel>

            <a
              className="notice-more-link"
              href={NOTICE_MORE_URL}
              target="_blank"
              rel="noreferrer"
            >
              더보기 <ChevronIcon />
            </a>
          </div>

          <p className="notice-board-description clamp-2">
            운영 변경사항, 업데이트, 개발·운영 시 참고해야 할 주요 공지를 확인하세요.
          </p>

          <div className="notice-preview-grid">
            <div className="notice-list notice-preview-column">
              {leftNotices.map(post => (
                <NoticeRow
                  key={post.id}
                  post={post}
                />
              ))}
            </div>

            <div className="notice-list notice-preview-column">
              {rightNotices.map(post => (
                <NoticeRow
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}