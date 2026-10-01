import * as React from 'react'
import { useAxSquare } from '../../context/AxSquareContext'

interface BannerMenuItem {
  key: string
  sortOrder: number
  icon: string
  label: string
  description: string
  href: string
}

/* =========================================================
   FALLBACK
   SharePoint 데이터를 받지 못했을 때 사용하는 기본 데이터
   ========================================================= */

const FALLBACK_BANNER_MENU: BannerMenuItem[] = [
  {
    key: 'work-request',
    sortOrder: 1,
    icon: '📋',
    label: '업무 요청',
    description: 'Agent 관련 신청 및 요청',
    href:
      'https://lgucorp.atlassian.net/jira/core/projects/NWAX/board?filter=&groupBy=none',
  },
  {
    key: 'operation-status',
    sortOrder: 2,
    icon: '📊',
    label: '운영 현황',
    description: '공동 운영 과제 및 문의 현황 확인',
    href:
      'https://lgucorp.atlassian.net/wiki/spaces/yuE2EYBu1YuB/pages/1487077824',
  },
  {
    key: 'operation-guide',
    sortOrder: 3,
    icon: '📚',
    label: '운영 정보',
    description: '과제 등록 · 인수인계 · 운영 가이드',
    href:
      'https://lgucorp.atlassian.net/wiki/spaces/yuE2EYBu1YuB/folder/1489014139/03.',
  },
  {
    key: 'server-status',
    sortOrder: 4,
    icon: '🖥️',
    label: '운영기 사용 현황',
    description: '운영기별 사용 여부와 현재 사용자 확인',
    href: '/server-status',
  },
  {
    key: 'studio',
    sortOrder: 5,
    icon: '✏️',
    label: '게시물 작성 Studio',
    description: '섹션을 조합해 운영 게시물 작성',
    href: '/posting-builder',
  },
]

const COPILOT_URL =
  'https://m365.cloud.microsoft/chat/agent/T_e3042231-6b5a-80b1-d0a4-e3914c7c0a90.ab993c79-d288-45e7-aaf1-51c66e081f69.gpt.4b89dee4-96b9-4086-83ac-d60040d8b77f'

function ExternalLinkIcon(): React.ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

function BotIcon(): React.ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
    </svg>
  )
}

function CopilotIcon(): React.ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}

function isExternalUrl(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin)
    return url.origin !== window.location.origin
  } catch {
    return false
  }
}

function BannerMenuItemView({
  item,
}: {
  item: BannerMenuItem
}): React.ReactElement {
  const external = isExternalUrl(item.href)

  return (
    <a
      className="banner-menu-item"
      href={item.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      <span className="banner-menu-item-icon">
        {item.icon}
      </span>

      <div className="banner-menu-item-copy">
        <div
          className="banner-menu-item-title clamp-1"
          title={item.label}
        >
          {item.label}
        </div>

        <div
          className="banner-menu-item-description clamp-1"
          title={item.description}
        >
          {item.description}
        </div>
      </div>

      <span className="banner-menu-item-external">
        <ExternalLinkIcon />
      </span>
    </a>
  )
}

function BannerMenu(): React.ReactElement {
  const { getPostsBySection } = useAxSquare()

  const posts = getPostsBySection('BANNER_MENU')
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)

  let menuItems: BannerMenuItem[]

  /* SharePoint 데이터 자체가 없는 경우 */
  if (posts.length === 0) {
    menuItems = FALLBACK_BANNER_MENU
  } else {
    const mappedItems = posts.map((post, index) => {
      const originalSortOrder = post.sortOrder

      /*
       * React 테스트 환경에서는 기존 SharePoint BANNER_MENU가
       * 1~4까지만 있어도 동작하도록 기존 4번 이후 메뉴를 한 칸 미룹니다.
       */
      const localSortOrder =
        originalSortOrder >= 4
          ? originalSortOrder + 1
          : originalSortOrder

      const fallback =
        FALLBACK_BANNER_MENU.find(
          (item) => item.sortOrder === localSortOrder
        ) ??
        FALLBACK_BANNER_MENU[index]

      return {
        key: `banner-${post.id}`,
        sortOrder: localSortOrder,
        icon:
          post.tag?.trim() ||
          fallback?.icon ||
          '🔗',
        label:
          post.title?.trim() ||
          fallback?.label ||
          '메뉴',
        description:
          post.summary?.trim() ||
          fallback?.description ||
          '',
        href:
          post.href?.trim() ||
          fallback?.href ||
          '#',
      }
    })

    /*
     * React 테스트용 로컬 페이지는 SharePoint List 수정 없이
     * 바로 테스트할 수 있도록 코드에서만 추가합니다.
     */
    menuItems = [
      ...mappedItems,
      FALLBACK_BANNER_MENU.find(
        (item) => item.key === 'server-status'
      ) as BannerMenuItem,
    ].sort((a, b) => a.sortOrder - b.sortOrder)
  }

  return (
    <div className="banner-menu-list">
      {menuItems.map((item) => (
        <BannerMenuItemView
          key={item.key}
          item={item}
        />
      ))}
    </div>
  )
}

export default function Banner(): React.ReactElement {
  return (
    <section className="banner-section">
      <div className="page-container banner-grid">
        <div className="banner-content">
          <div className="banner-team-label">
            <span>LG U+</span>

            <span className="banner-team-divider" />

            <span className="clamp-1">
              NW AX추진팀
            </span>
          </div>

          <div className="banner-title-row">
            <h1
              className="banner-title clamp-2"
              title="NW AX 운영스퀘어"
            >
              NW AX 운영스퀘어
            </h1>

            <a
              className="banner-copilot-link banner-copilot-mobile"
              href={COPILOT_URL}
              target="_blank"
              rel="noreferrer"
              title="운영센터 코파일럿 챗봇"
            >
              <CopilotIcon />

              <span>
                챗봇
              </span>
            </a>
          </div>

          <div className="banner-subtitle clamp-1">
            NW AX추진팀 · Agent 운영을 위한 통합 관리 플랫폼
          </div>

          <p className="banner-description clamp-3">
            운영 업무에 필요한 다양한 콘텐츠와 정보를 제공하여
            <br />
            보다 안정적이고 체계적인 업무 수행을 지원하고자 운영
            스퀘어를 오픈했습니다.
          </p>

          <a
            className="banner-copilot-link banner-copilot-desktop"
            href={COPILOT_URL}
            target="_blank"
            rel="noreferrer"
          >
            <CopilotIcon />

            운영센터 코파일럿 챗봇
          </a>
        </div>

        <div className="banner-menu-card">
          <div className="banner-menu-shell">
            <div className="banner-menu-header">
              <span className="banner-menu-header-icon">
                <BotIcon />
              </span>

              <span className="clamp-1">
                NW AX 운영스퀘어
              </span>
            </div>

            <BannerMenu />
          </div>

          <div className="banner-team-badge">
            NW AX추진팀
          </div>
        </div>
      </div>
    </section>
  )
}
