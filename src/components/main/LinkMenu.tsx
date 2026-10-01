import * as React from 'react'
import { useAxSquare } from '../../context/AxSquareContext'

type LinkMenuGroup =
  | '업무 요청'
  | '운영 현황'

interface LinkMenuItem {
  key: string
  sortOrder: number
  group: LinkMenuGroup
  icon: string
  title: string
  description: string
  href: string
}

/* =========================================================
   FALLBACK
   ========================================================= */

const FALLBACK_LINK_MENU: LinkMenuItem[] = [
  {
    key: 'new-environment',
    sortOrder: 1,
    group: '업무 요청',
    icon: '📄',
    title: '신규 개발기/운영기 신청',
    description: '신규 Agent 개발 및 운영 환경 신청',
    href:
      'https://lgucorp.atlassian.net/jira/core/projects/NWAX/form/3867/builder',
  },
  {
    key: 'schedule',
    sortOrder: 2,
    group: '업무 요청',
    icon: '📅',
    title: '과제 스케줄 등록/변경 신청',
    description: 'Agent 수행 스케줄 등록 및 변경 요청',
    href:
      'https://lgucorp.atlassian.net/jira/core/projects/NWAX/form/3866/builder',
  },
  {
    key: 'shared-operation',
    sortOrder: 3,
    group: '업무 요청',
    icon: '🔄',
    title: '공동 운영 전환 신청',
    description: '개별 운영 과제를 공동 운영 체계로 전환 요청',
    href:
      'https://lgucorp.atlassian.net/jira/core/projects/NWAX/form/3860/builder',
  },
  {
    key: 'faq',
    sortOrder: 4,
    group: '업무 요청',
    icon: '💬',
    title: '문의사항 등록 FAQ',
    description: '운영 관련 문의 및 FAQ 접수',
    href:
      'https://lgucorp.atlassian.net/jira/core/projects/NWAX/form/3865/builder',
  },
  {
    key: 'shared-status',
    sortOrder: 5,
    group: '운영 현황',
    icon: '📊',
    title: '공동 운영과제 현황',
    description: '공동 운영 중인 Agent 목록 및 현황 확인',
    href:
      'https://lgucorp.atlassian.net/wiki/spaces/yuE2EYBu1YuB/pages/1487077824',
  },
  {
    key: 'inquiry-status',
    sortOrder: 6,
    group: '운영 현황',
    icon: '📋',
    title: '문의사항 현황',
    description: '전체 문의 목록 및 처리 상태 확인',
    href:
      'https://lgucorp.atlassian.net/wiki/spaces/yuE2EYBu1YuB/pages/1486589820',
  },
]

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

function LinkCard({
  item,
}: {
  item: LinkMenuItem
}): React.ReactElement {
  return (
    <a
      className="link-card"
      href={item.href}
      target="_blank"
      rel="noreferrer"
    >
      <span className="link-card-icon">
        {item.icon}
      </span>

      <div className="link-card-copy">
        <div
          className="link-card-title clamp-2"
          title={item.title}
        >
          {item.title}
        </div>

        <div
          className="link-card-description clamp-2"
          title={item.description}
        >
          {item.description}
        </div>
      </div>

      <div className="link-card-action">
        바로가기

        <ExternalLinkIcon />
      </div>
    </a>
  )
}

function LinkSectionLabel({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="link-section-label">
      <span className="link-section-label-bar" />

      <span className="clamp-1">
        {children}
      </span>
    </div>
  )
}

function normalizeGroup(
  tag: string,
  fallbackGroup?: LinkMenuGroup
): LinkMenuGroup {
  const value = tag?.trim()

  if (
    value === '운영 현황' ||
    value?.toUpperCase() === 'STATUS'
  ) {
    return '운영 현황'
  }

  if (
    value === '업무 요청' ||
    value?.toUpperCase() === 'REQUEST'
  ) {
    return '업무 요청'
  }

  return fallbackGroup || '업무 요청'
}

export default function LinkMenu(): React.ReactElement {
  const { getPostsBySection } = useAxSquare()

  const posts = getPostsBySection('LINK_MENU')
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)

  let items: LinkMenuItem[]

  /* =========================================================
     SharePoint 데이터가 하나도 없는 경우
     → 기존 가데이터 전체 사용
     ========================================================= */

  if (posts.length === 0) {
    items = FALLBACK_LINK_MENU
  } else {
    items = posts.map((post, index) => {
      /*
       * Title 매칭 X
       *
       * sort_order만 기준으로 fallback 위치를 찾음
       */
      const fallback =
        FALLBACK_LINK_MENU.find(
          (item) =>
            item.sortOrder === post.sortOrder
        ) ??
        FALLBACK_LINK_MENU[index]

      return {
        key: `link-menu-${post.id}`,

        sortOrder:
          post.sortOrder,

        /*
         * tag로 좌/우 메뉴 그룹 결정
         */
        group: normalizeGroup(
          post.tag,
          fallback?.group
        ),

        /*
         * 아이콘 컬럼이 없기 때문에
         * 아이콘만 sort_order 기준 기존 아이콘 사용
         */
        icon:
          fallback?.icon ||
          '🔗',

        /*
         * SharePoint Title
         */
        title:
          post.title?.trim() ||
          fallback?.title ||
          '메뉴',

        /*
         * SharePoint summary
         */
        description:
          post.summary?.trim() ||
          fallback?.description ||
          '',

        /*
         * SharePoint href
         */
        href:
          post.href?.trim() ||
          fallback?.href ||
          '#',
      }
    })
  }

  /*
   * 그룹을 나눈 뒤 각 그룹에서도 sort_order 순으로 정렬
   */
  const requestItems = items
    .filter(
      (item) =>
        item.group === '업무 요청'
    )
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder
    )

  const statusItems = items
    .filter(
      (item) =>
        item.group === '운영 현황'
    )
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder
    )

  return (
    <section
      id="link-menu"
      className="link-menu-section"
    >
      <div className="page-container">
        <div className="section-heading link-menu-heading">
          <h2 className="section-title clamp-2">
            운영 업무 메뉴
          </h2>

          <p className="section-description clamp-2">
            아래 항목을 클릭하면 해당 페이지로 바로 이동합니다.
          </p>
        </div>

        <div className="link-menu-columns">

          {/* 업무 요청 */}
          <div className="link-menu-group">
            <LinkSectionLabel>
              업무 요청
            </LinkSectionLabel>

            <div className="link-card-grid">
              {requestItems.map((item) => (
                <LinkCard
                  key={item.key}
                  item={item}
                />
              ))}
            </div>
          </div>

          {/* 운영 현황 */}
          <div className="link-menu-group">
            <LinkSectionLabel>
              운영 현황
            </LinkSectionLabel>

            <div className="link-card-grid">
              {statusItems.map((item) => (
                <LinkCard
                  key={item.key}
                  item={item}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}