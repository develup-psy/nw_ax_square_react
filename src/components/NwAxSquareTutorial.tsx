/* eslint-disable max-lines */

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useAxSquare } from '../context/AxSquareContext'

type Placement =
  | 'left'
  | 'right'
  | 'bottom'
  | 'top'
  | 'viewport-left'
  | 'viewport-right'

type Rect = {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
  radius: string
}

type Step = {
  key: string
  type: 'intro' | 'guide' | 'outro'
  group?: string
  step?: number
  total?: number
  target?: string
  focus?: string
  placement?: Placement
  panelGap?: number
  icon?: string
  title: string
  body: string[]
  bullets?: string[]
}

const STORAGE_KEY =
  'nw-ax-square-tutorial-v1'

const TRANSITION_MS = 120

const PANEL_WIDTH = 340
const MIN_PANEL_WIDTH = 280

const EDGE = 18
const GAP = 18

const HEADER_OFFSET = 86

/*
 * [[텍스트]] 형태로 작성하면
 * 해당 부분만 마젠타 색으로 강조됩니다.
 */
const STEPS: Step[] = [
  /*
   * =========================================================
   * INTRO
   * =========================================================
   */
  {
    key: 'intro',
    type: 'intro',
    icon: '👋',

    title:
      'NW AX 운영스퀘어에 오신 것을 환영합니다!',

    body: [
      '전담자님의 Agent 운영을 조금 더 쉽고 빠르게 만들기 위해 [[업무 요청]], [[운영 현황]], 가이드와 노하우를 한 곳에 모았습니다.',
      '처음 오셨다면 잠깐만 따라와 주세요. 운영스퀘어에서 [[무엇을 어디서 해야 하는지]] 빠르게 알려드릴게요.',
    ],
  },

  /*
   * =========================================================
   * BANNER MENU
   * =========================================================
   */

  {
    key: 'banner-request',
    type: 'guide',

    group: '상단 빠른 메뉴',

    step: 1,
    total: 5,

    target:
      '.banner-menu-card',

    focus:
      '.banner-menu-item:nth-child(1)',

    placement:
      'left',

    icon: '📋',

    title:
      '해야 할 일이 생겼다면, [[업무 요청]]',

    body: [
      '[[신규 개발기·운영기 신청]], [[과제 스케줄 등록·변경]], [[공동 운영 전환]], [[문의사항]]까지 필요한 요청은 이곳에서 일괄적으로 진행해 주세요.',
    ],

    bullets: [
      '신규 개발기/운영기 신청',
      '과제 스케줄 등록·변경',
      '공동 운영 전환 신청',
      '문의사항 등록',
    ],
  },

  {
    key: 'banner-status',
    type: 'guide',

    group: '상단 빠른 메뉴',

    step: 2,
    total: 5,

    target:
      '.banner-menu-card',

    focus:
      '.banner-menu-item:nth-child(2)',

    placement:
      'left',

    icon: '📊',

    title:
      '요청했다면, [[운영 현황]]에서 바로 확인',

    body: [
      '업무 요청을 등록했다면 [[현재 어디까지 처리되었는지]] 운영 현황에서 확인하세요.',
      '이제 담당자에게 처리 상태를 따로 문의하거나 [[연락을 기다리지 않으셔도 됩니다]].',
    ],
  },

  {
    key: 'banner-info',
    type: 'guide',

    group: '상단 빠른 메뉴',

    step: 3,
    total: 5,

    target:
      '.banner-menu-card',

    focus:
      '.banner-menu-item:nth-child(3)',

    placement:
      'left',

    icon: '📚',

    title:
      '방법이 궁금하다면, [[운영 정보]]',

    body: [
      '[[과제 등록 방법]], [[운영 절차]], [[개발·운영 노하우]]처럼 반복적으로 필요한 정보를 운영 정보에 계속 쌓아두고 있습니다.',
      '누군가의 연락을 기다리기보다 [[필요한 내용을 먼저 확인]]해 보세요.',
    ],
  },

  {
    key: 'banner-server-status',
    type: 'guide',

    group: '상단 빠른 메뉴',

    step: 4,
    total: 5,

    target:
      '.banner-menu-card',

    focus:
      '.banner-menu-item:nth-child(4)',

    placement:
      'left',

    icon: '🖥️',

    title:
      '운영기 사용 여부는 [[운영기 사용 현황]]에서',

    body: [
      '각 운영기의 [[사용 가능 / 사용 중]] 상태와 현재 사용 중인 [[전담자 이름과 조직]]을 한 화면에서 확인할 수 있습니다.',
      '로봇 EMS와 EMS(RDP)를 별도 화면으로 나누지 않고 [[하나의 운영기 현황 화면]]에서 확인할 수 있습니다.',
    ],
  },

  {
    key: 'banner-studio',
    type: 'guide',

    group: '상단 빠른 메뉴',

    step: 5,
    total: 5,

    target:
      '.banner-menu-card',

    focus:
      '.banner-menu-item:nth-child(5)',

    placement:
      'left',

    icon: '✏️',

    title:
      '쉽게 만들고 공유하는 [[게시물 작성 Studio]]',

    body: [
      'NW AX추진팀은 전담자님들이 반복 작업보다 중요한 업무에 집중할 수 있도록 [[생산성을 높이는 도구]]를 만들고 있습니다.',
      'Studio에서는 별도의 디자인이나 HTML 작업 없이 [[섹션을 조합하고 내용만 입력]]해 운영 게시물을 빠르게 만들 수 있습니다.',
    ],
  },

  /*
   * =========================================================
   * 운영 업무 메뉴
   * =========================================================
   */

  {
    key: 'link-request',
    type: 'guide',

    group: '운영 업무 메뉴',

    step: 1,
    total: 2,

    target:
      '.link-menu-group:nth-child(1)',

    placement:
      'right',

    icon: '📝',

    title:
      '필요한 업무는 [[업무 요청]]에서 바로 진행하세요',

    body: [
      '[[신규 개발기/운영기 신청]], [[과제 스케줄 등록/변경]], [[공동 운영 전환 신청]], [[문의사항 등록]]처럼 실제 업무 요청이 필요하다면 업무 요청에서 필요한 항목을 선택해 바로 등록하시면 됩니다.',
    ],

    bullets: [
      '신규 개발기/운영기 신청',
      '과제 스케줄 등록/변경',
      '공동 운영 전환 신청',
      '문의사항 등록 FAQ',
    ],
  },

  {
    key: 'link-status',
    type: 'guide',

    group: '운영 업무 메뉴',

    step: 2,
    total: 2,

    target:
      '.link-menu-group:nth-child(2)',

    placement:
      'left',

    icon: '🔎',

    title:
      '요청한 건의 상태는 [[운영 현황]]에서 확인하세요',

    body: [
      '업무 요청에서 등록한 뒤 현재 어떻게 처리되고 있는지 궁금하다면 [[운영 현황]]에서 확인하세요. [[공동 운영과제 현황]]과 [[문의사항 현황]]을 통해 요청한 건의 상태를 직접 확인할 수 있습니다.',
    ],
  },

  /*
   * =========================================================
   * INFORMATION
   * =========================================================
   */

  {
    key: 'information',
    type: 'guide',

    group: '처음이라면 꼭 확인',

    step: 1,
    total: 3,

    target:
      '.information-content',

    /*
     * 설명 패널은 무조건 오른쪽
     */
    placement:
      'viewport-right',

    icon: '🧭',

    title:
      '처음 하는 업무라면 [[INFORMATION]]부터',

    body: [
      '[[과제 등록부터 인수인계와 공동 운영 전환까지]] 필요한 절차를 실제 업무 순서대로 정리했습니다.',
      '처음 수행하는 업무라면 별도로 절차를 외우지 말고 [[정리된 순서 그대로]] 진행하시면 됩니다.',
    ],
  },

  /*
   * =========================================================
   * NOTICE
   * =========================================================
   */

  {
    key: 'notice',
    type: 'guide',

    group: '처음이라면 꼭 확인',

    step: 2,
    total: 3,

    target:
      '.notice-content',

    /*
     * 설명 패널은 무조건 오른쪽
     */
    placement:
      'viewport-right',

    icon: '📢',

    title:
      '달라진 내용은 [[NOTICE]]에서 확인하세요',

    body: [
      '[[운영 정책]], [[일정]], [[버전]], [[환경]]처럼 업무에 영향을 줄 수 있는 주요 변경사항을 NOTICE에 안내합니다.',
      '운영스퀘어에 들어오셨다면 [[새로운 공지가 있는지]] 한 번씩 확인해 주세요.',
    ],
  },

  /*
   * =========================================================
   * INSIGHT
   * =========================================================
   */

  {
    key: 'insight',
    type: 'guide',

    group: '처음이라면 꼭 확인',

    step: 3,
    total: 3,

    target:
      '.insight-content',

    /*
     * 설명 패널은 무조건 오른쪽
     */
    placement:
      'viewport-right',

    icon: '💡',

    title:
      '같은 문제를 두 번 해결하지 않도록, [[INSIGHT]]',

    body: [
      '운영 과정에서 자주 발생하는 [[문제와 해결 방법]], [[개발·운영 노하우]]를 계속 축적합니다.',
      '문제가 생겼다면 처음부터 다시 해결하기 전에 [[비슷한 사례가 있는지]] 먼저 확인해 보세요.',
    ],
  },

  /*
   * =========================================================
   * FOOTER COPILOT
   * =========================================================
   *
   * 실제 Footer 구조:
   *
   * .footer-tool-grid
   *   ├─ .footer-tool-card  ← AI Copilot
   *   └─ .footer-tool-card  ← NW AX Square Studio
   *
   * 따라서 첫 번째 카드를 선택
   */

  {
    key: 'copilot',
    type: 'guide',

    group: '문제 해결',

    step: 1,
    total: 1,

    target:
      '.footer-tool-card:first-child',

    /*
     * Copilot 카드는 왼쪽에 보이고
     * 설명 패널은 오른쪽에 고정
     */
    placement:
      'viewport-right',

    panelGap:
      28,

    icon: '🤖',

    title:
      '그래도 잘 모르겠다면, [[운영스퀘어 Copilot]]',

    body: [
      '궁금한 점이나 문제가 생겼다면 바로 문의를 등록하기 전에 [[INFORMATION / INSIGHT]]를 확인하고 [[운영스퀘어 Copilot]]에게 먼저 질문해 보세요.',
      '그래도 답변이 애매하거나 별도의 지원이 필요하다면 [[문의사항 FAQ]]에 등록해 주세요.',
    ],

    bullets: [
      'INFORMATION / INSIGHT 확인',
      '운영스퀘어 Copilot에게 질문',
      '그래도 해결되지 않으면 문의사항 FAQ 등록',
    ],
  },

  /*
   * =========================================================
   * OUTRO
   * =========================================================
   */

  {
    key: 'outro',
    type: 'outro',

    icon: '🎉',

    title:
      'NW AX 운영스퀘어 튜토리얼 완료!',

    body: [
      '업무 요청과 진행 현황을 한 곳에 기록하고, 운영 과정에서 얻은 정보와 노하우를 함께 축적하면 [[개인의 경험이 우리 모두의 운영 기준]]이 됩니다.',
      '전담자님들의 협조를 바탕으로 더 체계적이고 효율적인 [[NW AX 운영 체계]]를 만들고, 이를 [[U+만의 AX 운영 표준]]으로 발전시켜 나가겠습니다.',
      '함께 만들어주셔서 감사합니다.',
    ],

    bullets: [
      '업무가 필요하면 → 업무 요청',
      '진행 상태가 궁금하면 → 운영 현황',
      '방법이 궁금하면 → 운영 정보 / INFORMATION',
      '변경사항은 → NOTICE',
      '문제가 생기면 → INSIGHT → Copilot → 문의사항 FAQ',
    ],
  },
]

/*
 * =========================================================
 * localStorage
 * =========================================================
 */

function completed(): boolean {
  try {
    return (
      window.localStorage.getItem(
        STORAGE_KEY
      ) === 'completed'
    )
  } catch {
    return false
  }
}

function markCompleted(): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      'completed'
    )
  } catch {
    /*
     * localStorage가 차단되어 있어도
     * 현재 화면에서는 정상 종료
     */
  }
}

/*
 * URL에 guide=1이 있으면
 * 완료 여부와 관계없이 다시 튜토리얼 실행
 *
 * 예:
 * ?env=WebView&guide=1
 */
function forceGuide(): boolean {
  try {
    return (
      new URLSearchParams(
        window.location.search
      ).get('guide') === '1'
    )
  } catch {
    return false
  }
}

/*
 * =========================================================
 * Element 검색
 * =========================================================
 */

function findVisible(
  selector?: string
): HTMLElement | null {
  if (!selector) {
    return null
  }

  const elements =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        selector
      )
    )

  return (
    elements.find(element => {
      const rect =
        element.getBoundingClientRect()

      const style =
        window.getComputedStyle(
          element
        )

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      )
    }) ||
    elements[0] ||
    null
  )
}

/*
 * =========================================================
 * Spotlight Rect
 * =========================================================
 */

function rectOf(
  element: HTMLElement | null
): Rect | null {
  if (!element) {
    return null
  }

  const source =
    element.getBoundingClientRect()

  const style =
    window.getComputedStyle(
      element
    )

  const padding = 6

  /*
   * 실제 Target 전체를 기준으로 잡습니다.
   *
   * 다만 Spotlight는 position: fixed이므로
   * 현재 viewport 밖의 부분은 viewport 경계에서 clip
   */
  const top =
    Math.max(
      8,
      source.top - padding
    )

  const left =
    Math.max(
      8,
      source.left - padding
    )

  const right =
    Math.min(
      window.innerWidth - 8,
      source.right + padding
    )

  const bottom =
    Math.min(
      window.innerHeight - 8,
      source.bottom + padding
    )

  return {
    top,
    left,
    right,
    bottom,

    width:
      Math.max(
        0,
        right - left
      ),

    height:
      Math.max(
        0,
        bottom - top
      ),

    radius:
      style.borderRadius &&
      style.borderRadius !== '0px'
        ? style.borderRadius
        : '14px',
  }
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(
      value,
      min
    ),
    max
  )
}

/*
 * =========================================================
 * 설명 Panel 위치
 * =========================================================
 */

function panelPosition(
  rect: Rect | null,
  placement: Placement = 'right',
  customGap: number = GAP,
  measuredPanelHeight: number = 360
): React.CSSProperties {
  const maxAvailableWidth =
    Math.max(
      MIN_PANEL_WIDTH,
      window.innerWidth -
        EDGE * 2
    )

  const preferredWidth =
    Math.min(
      PANEL_WIDTH,
      maxAvailableWidth
    )

  const panelHeight =
    Math.min(
      measuredPanelHeight || 360,
      window.innerHeight -
        EDGE * 2
    )

  /*
   * INTRO / OUTRO
   */
  if (!rect) {
    return {
      left:
        '50%',

      top:
        '50%',

      transform:
        'translate(-50%, -50%)',

      width:
        preferredWidth,
    }
  }

  /*
   * =====================================================
   * viewport-right
   *
   * INFORMATION
   * NOTICE
   * INSIGHT
   * Copilot
   *
   * 설명 패널을 무조건 오른쪽에 고정
   * =====================================================
   */
  if (
    placement ===
    'viewport-right'
  ) {
    return {
      width:
        preferredWidth,

      right:
        EDGE + 8,

      top:
        clamp(
          rect.top + 8,

          HEADER_OFFSET + 8,

          Math.max(
            HEADER_OFFSET + 8,

            window.innerHeight -
              panelHeight -
              EDGE -
              8
          )
        ),
    }
  }

  /*
   * viewport-left
   */
  if (
    placement ===
    'viewport-left'
  ) {
    return {
      width:
        preferredWidth,

      left:
        EDGE + 8,

      top:
        clamp(
          rect.top +
            Math.min(
              rect.height,
              window.innerHeight
            ) /
              2 -
            panelHeight / 2,

          EDGE + 8,

          Math.max(
            EDGE + 8,

            window.innerHeight -
              panelHeight -
              EDGE -
              8
          )
        ),
    }
  }

  /*
   * 일반 좌우 배치
   */

  const rightSpace =
    window.innerWidth -
    rect.right -
    customGap -
    EDGE

  const leftSpace =
    rect.left -
    customGap -
    EDGE

  const topSpace =
    rect.top -
    customGap -
    EDGE

  const bottomSpace =
    window.innerHeight -
    rect.bottom -
    customGap -
    EDGE

  const sideTop =
    clamp(
      rect.top +
        rect.height / 2 -
        panelHeight / 2,

      EDGE,

      Math.max(
        EDGE,

        window.innerHeight -
          panelHeight -
          EDGE
      )
    )

  const rightWidth =
    Math.min(
      preferredWidth,
      rightSpace
    )

  const leftWidth =
    Math.min(
      preferredWidth,
      leftSpace
    )

  /*
   * 오른쪽
   */
  if (
    placement === 'right' &&
    rightWidth >=
      MIN_PANEL_WIDTH
  ) {
    return {
      width:
        rightWidth,

      left:
        rect.right +
        customGap,

      top:
        sideTop,
    }
  }

  /*
   * 왼쪽
   */
  if (
    placement === 'left' &&
    leftWidth >=
      MIN_PANEL_WIDTH
  ) {
    return {
      width:
        leftWidth,

      left:
        rect.left -
        customGap -
        leftWidth,

      top:
        sideTop,
    }
  }

  /*
   * 위
   */
  if (
    placement === 'top' &&
    topSpace >= panelHeight
  ) {
    return {
      width:
        preferredWidth,

      left:
        clamp(
          rect.left +
            rect.width / 2 -
            preferredWidth / 2,

          EDGE,

          Math.max(
            EDGE,

            window.innerWidth -
              preferredWidth -
              EDGE
          )
        ),

      top:
        rect.top -
        customGap -
        panelHeight,
    }
  }

  /*
   * 아래
   */
  if (
    placement === 'bottom' &&
    bottomSpace >=
      panelHeight
  ) {
    return {
      width:
        preferredWidth,

      left:
        clamp(
          rect.left +
            rect.width / 2 -
            preferredWidth / 2,

          EDGE,

          Math.max(
            EDGE,

            window.innerWidth -
              preferredWidth -
              EDGE
          )
        ),

      top:
        rect.bottom +
        customGap,
    }
  }

  /*
   * 요청 방향에 공간이 없을 때
   * 반대 방향 확인
   */

  if (
    placement === 'right' &&
    leftWidth >=
      MIN_PANEL_WIDTH
  ) {
    return {
      width:
        leftWidth,

      left:
        rect.left -
        customGap -
        leftWidth,

      top:
        sideTop,
    }
  }

  if (
    placement === 'left' &&
    rightWidth >=
      MIN_PANEL_WIDTH
  ) {
    return {
      width:
        rightWidth,

      left:
        rect.right +
        customGap,

      top:
        sideTop,
    }
  }

  /*
   * 그래도 공간이 부족한 경우
   * Target을 덮지 않고
   * viewport 위/아래 중 넓은 곳 사용
   */

  if (
    bottomSpace >=
    topSpace
  ) {
    return {
      width:
        preferredWidth,

      left:
        clamp(
          rect.left +
            rect.width / 2 -
            preferredWidth / 2,

          EDGE,

          Math.max(
            EDGE,

            window.innerWidth -
              preferredWidth -
              EDGE
          )
        ),

      bottom:
        EDGE,
    }
  }

  return {
    width:
      preferredWidth,

    left:
      clamp(
        rect.left +
          rect.width / 2 -
          preferredWidth / 2,

        EDGE,

        Math.max(
          EDGE,

          window.innerWidth -
            preferredWidth -
            EDGE
        )
      ),

    top:
      EDGE,
  }
}

/*
 * =========================================================
 * SharePoint 실제 Scroll Container
 * =========================================================
 *
 * SharePoint Modern Page / Full Page WebPart에서는
 * window가 아니라 아래 div가 실제로 scroll 됩니다.
 *
 * <div data-automation-id="contentScrollRegion">
 */

function getSharePointScrollContainer():
HTMLElement | null {
  return document.querySelector<HTMLElement>(
    '[data-automation-id="contentScrollRegion"]'
  )
}

/*
 * =========================================================
 * Target 자동 스크롤
 * =========================================================
 */

function scrollToTarget(
  element: HTMLElement,
  step: Step,
  measuredPanelHeight: number
): void {
  const rect =
    element.getBoundingClientRect()

  const panelHeight =
    measuredPanelHeight || 360

  const gap =
    step.panelGap || GAP

  let desiredViewportTop =
    HEADER_OFFSET

  /*
   * Panel이 위쪽
   */
  if (
    step.placement === 'top'
  ) {
    desiredViewportTop =
      Math.min(
        window.innerHeight -
          Math.min(
            rect.height,
            280
          ) -
          EDGE,

        panelHeight +
          gap +
          EDGE +
          12
      )
  }

  /*
   * INFORMATION
   * NOTICE
   * INSIGHT
   * Copilot
   */
  else if (
    step.placement ===
      'viewport-right' ||
    step.placement ===
      'viewport-left'
  ) {
    desiredViewportTop =
      HEADER_OFFSET + 22
  }

  /*
   * 업무 요청 / 운영 현황
   * Banner Menu 등 좌우 설명
   */
  else if (
    step.placement ===
      'left' ||
    step.placement ===
      'right'
  ) {
    desiredViewportTop =
      clamp(
        (
          window.innerHeight -
          Math.min(
            rect.height,
            620
          )
        ) /
          2,

        HEADER_OFFSET,

        Math.max(
          HEADER_OFFSET,

          window.innerHeight *
            0.28
        )
      )
  }

  const scrollContainer =
    getSharePointScrollContainer()

  /*
   * =====================================================
   * SharePoint Modern / SPFx
   * =====================================================
   */
  if (scrollContainer) {
    const maxScrollTop =
      Math.max(
        0,

        scrollContainer
          .scrollHeight -

        scrollContainer
          .clientHeight
      )

    /*
     * rect.top
     * → 현재 viewport 기준 Target 위치
     *
     * scrollTop
     * → SharePoint scroll div의 현재 위치
     *
     * 둘의 차이를 계산해서
     * 실제 scroll container를 이동
     */
    const nextScrollTop =
      clamp(
        scrollContainer
          .scrollTop +
          rect.top -
          desiredViewportTop,

        0,

        maxScrollTop
      )

    scrollContainer.scrollTo({
      top:
        nextScrollTop,

      behavior:
        'auto',
    })

    return
  }

  /*
   * =====================================================
   * 일반 웹 fallback
   * =====================================================
   */

  const absoluteTop =
    window.scrollY +
    rect.top

  window.scrollTo({
    top:
      Math.max(
        0,

        absoluteTop -
          desiredViewportTop
      ),

    behavior:
      'auto',
  })
}

/*
 * =========================================================
 * 강조 텍스트
 * =========================================================
 */

function RichText({
  text,
}: {
  text: string
}): React.ReactElement {
  const parts =
    text
      .split(
        /(\[\[.*?\]\])/g
      )
      .filter(Boolean)

  return (
    <>
      {parts.map(
        (
          part,
          index
        ) => {
          if (
            part.startsWith(
              '[['
            ) &&
            part.endsWith(
              ']]'
            )
          ) {
            return (
              <span
                className="nwax-guide-keyword"
                key={`${part}-${index}`}
              >
                {part.slice(
                  2,
                  -2
                )}
              </span>
            )
          }

          return (
            <React.Fragment
              key={`${part}-${index}`}
            >
              {part}
            </React.Fragment>
          )
        }
      )}
    </>
  )
}

/*
 * =========================================================
 * Tutorial 전용 CSS
 * =========================================================
 */

const STYLE = `
.nwax-guide-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  font-family:
    var(
      --nwax-font-family,
      "Pretendard",
      "LG Smart UI",
      Arial,
      sans-serif
    );
  pointer-events: none;
  animation:
    nwaxGuideRootIn
    .24s
    ease
    both;
}

.nwax-guide-spotlight {
  position: fixed;
  z-index: 2147483000;
  pointer-events: none;
  background: transparent;

  box-shadow:
    0 0 0 1px
      rgba(
        230,
        0,
        126,
        .24
      ),
    0 0 0 9999px
      rgba(
        14,
        20,
        30,
        .64
      );

  animation:
    nwaxGuideSpotlightIn
    ${TRANSITION_MS}ms
    ease-out
    both;
}

.nwax-guide-full-dim {
  position: fixed;
  inset: 0;
  z-index: 2147483000;

  background:
    rgba(
      14,
      20,
      30,
      .64
    );

  animation:
    nwaxGuideFadeIn
    .22s
    ease
    both;
}

/*
 * Banner 내부 현재 메뉴 강조
 *
 * 강한 Stroke를 사용하지 않고
 * 약한 배경 + 1px 정도만 사용
 */
.nwax-guide-active-item {
  position: relative;
  z-index: 1;

  border-radius:
    12px;

  background:
    rgba(
      230,
      0,
      126,
      .050
    ) !important;

  box-shadow:
    0 0 0 1px
      rgba(
        230,
        0,
        126,
        .22
      ) !important;

  transition:
    background
      .14s ease,
    box-shadow
      .14s ease
    !important;
}

.nwax-guide-panel-anchor {
  position: fixed;
  z-index: 2147483004;
  pointer-events: auto;
  transition: none;
}

.nwax-guide-panel {
  box-sizing:
    border-box;

  width:
    100%;

  max-height:
    calc(
      100vh - 36px
    );

  overflow-y:
    auto;

  padding:
    22px 23px;

  border:
    0;

  border-radius:
    18px;

  background:
    rgba(
      255,
      255,
      255,
      .98
    );

  color:
    #171717;

  box-shadow:
    0 24px 70px
      rgba(
        0,
        0,
        0,
        .22
      );

  animation:
    nwaxGuidePanelIn
    ${TRANSITION_MS}ms
    ease-out
    both;
}

.nwax-guide-panel::-webkit-scrollbar {
  width:
    6px;
}

.nwax-guide-panel::-webkit-scrollbar-thumb {
  background:
    #d5d5d8;

  border-radius:
    999px;
}

.nwax-guide-top {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    16px;

  margin-bottom:
    14px;
}

.nwax-guide-badge {
  display:
    inline-flex;

  align-items:
    center;

  gap:
    7px;

  padding:
    6px 10px;

  border-radius:
    999px;

  background:
    rgba(
      230,
      0,
      126,
      .075
    );

  color:
    #ad005f;

  font-size:
    11px;

  font-weight:
    800;
}

.nwax-guide-skip {
  border:
    0;

  background:
    transparent;

  color:
    #858589;

  cursor:
    pointer;

  font:
    inherit;

  font-size:
    12px;
}

.nwax-guide-skip:hover {
  color:
    #333;
}

.nwax-guide-progress {
  display:
    flex;

  align-items:
    center;

  gap:
    10px;

  margin-bottom:
    13px;

  color:
    #8c8c91;

  font-size:
    11px;

  font-weight:
    800;
}

.nwax-guide-track {
  position:
    relative;

  flex:
    1;

  height:
    3px;

  overflow:
    hidden;

  border-radius:
    999px;

  background:
    #ededf0;
}

.nwax-guide-track span {
  position:
    absolute;

  inset:
    0 auto 0 0;

  border-radius:
    inherit;

  background:
    #e6007e;

  transition:
    width
    .14s
    ease-out;
}

.nwax-guide-title {
  margin:
    0 0 11px;

  color:
    #18181a;

  font-size:
    20px;

  line-height:
    1.42;

  font-weight:
    800;

  word-break:
    keep-all;
}

.nwax-guide-keyword {
  color:
    #e6007e;

  font-weight:
    800;
}

.nwax-guide-body {
  color:
    #505055;

  font-size:
    13.5px;

  line-height:
    1.72;

  word-break:
    keep-all;
}

.nwax-guide-body p {
  margin:
    0;
}

.nwax-guide-body p + p {
  margin-top:
    8px;
}

.nwax-guide-bullets {
  display:
    grid;

  gap:
    6px;

  margin:
    14px 0 0;

  padding:
    12px 14px;

  border-radius:
    12px;

  background:
    #f7f7f9;

  list-style:
    none;
}

.nwax-guide-bullets li {
  position:
    relative;

  padding-left:
    15px;

  color:
    #38383c;

  font-size:
    12.5px;

  line-height:
    1.48;
}

.nwax-guide-bullets li::before {
  content:
    "→";

  position:
    absolute;

  left:
    0;

  color:
    #e6007e;

  font-weight:
    800;
}

.nwax-guide-actions {
  display:
    flex;

  justify-content:
    flex-end;

  gap:
    8px;

  margin-top:
    19px;
}

.nwax-guide-button {
  min-height:
    38px;

  padding:
    0 15px;

  border-radius:
    10px;

  cursor:
    pointer;

  font:
    inherit;

  font-size:
    12.5px;

  font-weight:
    750;

  transition:
    background
      .18s ease,
    color
      .18s ease,
    transform
      .18s ease,
    opacity
      .18s ease;
}

.nwax-guide-button:disabled {
  opacity:
    .46;

  cursor:
    default;
}

.nwax-guide-button:not(:disabled):active {
  transform:
    translateY(1px);
}

.nwax-guide-secondary {
  border:
    0;

  background:
    #f1f1f3;

  color:
    #505055;
}

.nwax-guide-secondary:hover:not(:disabled) {
  background:
    #e7e7ea;
}

.nwax-guide-primary {
  border:
    0;

  background:
    #e6007e;

  color:
    #fff;
}

.nwax-guide-primary:hover:not(:disabled) {
  background:
    #ca006f;
}

.nwax-guide-wide {
  width:
    100%;
}

@keyframes nwaxGuideRootIn {
  from {
    opacity:
      0;
  }

  to {
    opacity:
      1;
  }
}

@keyframes nwaxGuideFadeIn {
  from {
    opacity:
      0;
  }

  to {
    opacity:
      1;
  }
}

@keyframes nwaxGuideSpotlightIn {
  from {
    opacity:
      .35;
  }

  to {
    opacity:
      1;
  }
}

@keyframes nwaxGuidePanelIn {
  from {
    opacity:
      0;

    transform:
      translateY(
        5px
      );
  }

  to {
    opacity:
      1;

    transform:
      translateY(
        0
      );
  }
}


/* =========================================================
 * 튜토리얼 다시 보기 버튼
 * ========================================================= */
.nwax-guide-replay-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2147482500;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  height: 42px;
  padding: 0 15px 0 10px;

  border: 0;
  border-radius: 12px;

  background: rgba(255, 255, 255, .98);
  color: #45454a;

  box-shadow: 0 8px 26px rgba(0, 0, 0, .14);

  cursor: pointer;
  font: inherit;
  font-size: 12.5px;
  font-weight: 800;

  transition:
    transform .15s ease,
    box-shadow .15s ease,
    color .15s ease;
}

.nwax-guide-replay-button:hover {
  color: #e6007e;
  transform: translateY(-2px);
  box-shadow: 0 11px 30px rgba(0, 0, 0, .18);
}

.nwax-guide-replay-button:active {
  transform: translateY(0);
}

.nwax-guide-replay-icon {
  display: grid;
  place-items: center;

  width: 24px;
  height: 24px;

  border-radius: 8px;
  background: rgba(230, 0, 126, .08);
  color: #e6007e;

  font-size: 13px;
  font-weight: 900;
  line-height: 1;
}

@media (
  max-width: 760px
) {
  .nwax-guide-panel-anchor {
    left:
      14px
      !important;

    right:
      14px
      !important;

    top:
      auto
      !important;

    bottom:
      14px
      !important;

    width:
      auto
      !important;

    transition:
      none;
  }

  .nwax-guide-panel {
    max-height:
      55vh;

    padding:
      18px;

    border-radius:
      16px;
  }

  .nwax-guide-title {
    font-size:
      17px;
  }

  .nwax-guide-body {
    font-size:
      13px;
  }

  .nwax-guide-replay-button {
    right: 14px;
    bottom: 14px;
    height: 40px;
  }
}
`

/*
 * =========================================================
 * Main Component
 * =========================================================
 */

export default function NwAxSquareTutorial():
React.ReactElement | null {
  const {
    isLoaded,
  } = useAxSquare()

  const [
    open,
    setOpen,
  ] =
    useState(false)

  const [
    index,
    setIndex,
  ] =
    useState(0)

  const [
    targetRect,
    setTargetRect,
  ] =
    useState<Rect | null>(
      null
    )

  const [
    transitioning,
    setTransitioning,
  ] =
    useState(false)

  const [
    panelHeight,
    setPanelHeight,
  ] =
    useState(360)

  const panelRef =
    useRef<HTMLElement | null>(
      null
    )

  const step =
    STEPS[index]

  /*
   * =====================================================
   * 최초 실행
   * =====================================================
   */
  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (
      !forceGuide() &&
      completed()
    ) {
      return
    }

    let active =
      true

    let timer =
      0

    const tryOpen =
      (): void => {
        if (!active) {
          return
        }

        /*
         * HOT_NOTICE가 열려 있으면
         * 먼저 공지를 보여주고
         * 닫힌 뒤 Tutorial 시작
         */
        if (
          document.querySelector(
            '.hot-notice-overlay'
          )
        ) {
          timer =
            window.setTimeout(
              tryOpen,
              180
            )

          return
        }

        setIndex(0)
        setOpen(true)
      }

    timer =
      window.setTimeout(
        tryOpen,
        220
      )

    return () => {
      active =
        false

      window.clearTimeout(
        timer
      )
    }
  }, [
    isLoaded,
  ])

  /*
   * =====================================================
   * Step 변경
   * =====================================================
   */
  useEffect(() => {
    if (!open) {
      return
    }

    const target =
      findVisible(
        step.target
      )

    const focus =
      findVisible(
        step.focus
      )

    /*
     * Banner 현재 메뉴
     * 강조
     */
    if (focus) {
      focus.classList.add(
        'nwax-guide-active-item'
      )
    }

    /*
     * Guide Step이면
     * 실제 Target으로 이동
     */
    if (
      step.type ===
        'guide' &&
      target
    ) {
      /*
       * 먼저 현재 위치를 잡아
       * 설명 Panel이 순간적으로
       * 사라지는 것을 방지
       */
      setTargetRect(
        rectOf(
          target
        )
      )

      /*
       * SharePoint contentScrollRegion 이동
       */
      scrollToTarget(
        target,
        step,
        panelHeight
      )
    } else {
      setTargetRect(
        null
      )
    }

    /*
     * Scroll 이후
     * Target 위치 재측정
     */
    const update =
      (): void => {
        setTargetRect(
          step.type ===
            'guide'
            ? rectOf(
                findVisible(
                  step.target
                )
              )
            : null
        )
      }

    const settleTimer =
      window.setTimeout(
        update,
        24
      )

    /*
     * SharePoint 실제 Scroll Container
     */
    const scrollContainer =
      getSharePointScrollContainer()

    /*
     * resize
     */
    window.addEventListener(
      'resize',
      update
    )

    /*
     * SharePoint에서는
     * window가 아니라
     * contentScrollRegion의 scroll을 감시
     */
    if (
      scrollContainer
    ) {
      scrollContainer
        .addEventListener(
          'scroll',
          update,
          {
            passive:
              true,
          }
        )
    } else {
      /*
       * 일반 웹 fallback
       */
      window.addEventListener(
        'scroll',
        update,
        {
          passive:
            true,
        }
      )
    }

    return () => {
      window.clearTimeout(
        settleTimer
      )

      window.removeEventListener(
        'resize',
        update
      )

      if (
        scrollContainer
      ) {
        scrollContainer
          .removeEventListener(
            'scroll',
            update
          )
      } else {
        window.removeEventListener(
          'scroll',
          update
        )
      }

      if (focus) {
        focus.classList.remove(
          'nwax-guide-active-item'
        )
      }
    }
  }, [
    open,
    index,
    step,
  ])

  /*
   * =====================================================
   * 실제 Panel 높이 측정
   * =====================================================
   */
  useEffect(() => {
    if (
      !open ||
      !panelRef.current
    ) {
      return
    }

    const nextHeight =
      panelRef.current
        .getBoundingClientRect()
        .height

    if (
      nextHeight > 0 &&
      Math.abs(
        nextHeight -
        panelHeight
      ) > 2
    ) {
      setPanelHeight(
        nextHeight
      )
    }
  }, [
    open,
    index,
    panelHeight,
  ])

  /*
   * =====================================================
   * Keyboard
   *
   * ESC
   * ←
   * →
   * =====================================================
   */
  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown =
      (
        event:
          KeyboardEvent
      ): void => {
        /*
         * ESC
         */
        if (
          event.key ===
          'Escape'
        ) {
          markCompleted()
          setOpen(false)

          return
        }

        if (
          transitioning
        ) {
          return
        }

        /*
         * 이전
         */
        if (
          event.key ===
            'ArrowLeft' &&
          index > 0
        ) {
          setTransitioning(
            true
          )

          setIndex(
            value =>
              Math.max(
                0,
                value - 1
              )
          )

          window.setTimeout(
            () =>
              setTransitioning(
                false
              ),
            TRANSITION_MS
          )
        }

        /*
         * 다음
         */
        if (
          event.key ===
          'ArrowRight'
        ) {
          if (
            index >=
            STEPS.length - 1
          ) {
            markCompleted()
            setOpen(false)

            return
          }

          setTransitioning(
            true
          )

          setIndex(
            value =>
              Math.min(
                STEPS.length -
                  1,
                value + 1
              )
          )

          window.setTimeout(
            () =>
              setTransitioning(
                false
              ),
            TRANSITION_MS
          )
        }
      }

    window.addEventListener(
      'keydown',
      onKeyDown
    )

    return () => {
      window.removeEventListener(
        'keydown',
        onKeyDown
      )
    }
  }, [
    open,
    index,
    transitioning,
  ])

  /*
   * =====================================================
   * 튜토리얼 다시 보기
   * =====================================================
   * localStorage 완료값을 지우고 React state를 직접 열기 때문에
   * 새로고침 없이 즉시 첫 화면부터 다시 시작합니다.
   */
  const replayTutorial = (): void => {
    try {
      window.localStorage.removeItem(
        STORAGE_KEY
      )
    } catch {
      /*
       * localStorage를 사용할 수 없는 환경이어도
       * 현재 화면에서는 즉시 다시 실행
       */
    }

    setTransitioning(false)
    setTargetRect(null)
    setPanelHeight(360)
    setIndex(0)
    setOpen(true)
  }

  /*
   * 튜토리얼이 닫혀 있으면 우측 하단에 다시 보기 버튼 표시
   */
  if (!open) {
    return (
      <>
        <style>
          {STYLE}
        </style>

        <button
          type="button"
          className="nwax-guide-replay-button"
          onClick={replayTutorial}
          aria-label="NW AX 운영스퀘어 사용 가이드 다시 보기"
          title="사용 가이드 다시 보기"
        >
          <span className="nwax-guide-replay-icon">
            ?
          </span>

          <span>
            사용 가이드
          </span>
        </button>
      </>
    )
  }

  const intro =
    step.type ===
    'intro'

  const outro =
    step.type ===
    'outro'

  /*
   * =====================================================
   * Skip
   * =====================================================
   */
  const skip =
    (): void => {
      markCompleted()
      setOpen(false)
    }

  /*
   * =====================================================
   * Step 이동
   * =====================================================
   */
  const moveTo =
    (
      nextIndex:
        number
    ): void => {
      if (
        transitioning
      ) {
        return
      }

      setTransitioning(
        true
      )

      setIndex(
        clamp(
          nextIndex,
          0,
          STEPS.length - 1
        )
      )

      window.setTimeout(
        () => {
          setTransitioning(
            false
          )
        },
        TRANSITION_MS
      )
    }

  /*
   * 다음
   */
  const next =
    (): void => {
      if (
        transitioning
      ) {
        return
      }

      if (
        index >=
        STEPS.length - 1
      ) {
        markCompleted()
        setOpen(false)

        return
      }

      moveTo(
        index + 1
      )
    }

  /*
   * 이전
   */
  const previous =
    (): void => {
      if (
        index <= 0
      ) {
        return
      }

      moveTo(
        index - 1
      )
    }

  /*
   * =====================================================
   * Panel 위치 계산
   * =====================================================
   */

  const placement =
    step.placement ||
    'right'

  const panelStyle =
    panelPosition(
      intro || outro
        ? null
        : targetRect,

      placement,

      step.panelGap ||
        GAP,

      panelHeight
    )

  /*
   * =====================================================
   * Render
   * =====================================================
   */

  return (
    <div className="nwax-guide-root">
      <style>
        {STYLE}
      </style>

      {/*
       * =================================================
       * Spotlight
       * =================================================
       */}
      {step.type ===
        'guide' &&
      targetRect ? (
        <div
          key={`spotlight-${step.key}`}
          className="nwax-guide-spotlight"
          style={{
            top:
              targetRect.top,

            left:
              targetRect.left,

            width:
              targetRect.width,

            height:
              targetRect.height,

            borderRadius:
              targetRect.radius,
          }}
        />
      ) : (
        /*
         * INTRO / OUTRO
         */
        <div className="nwax-guide-full-dim" />
      )}

      {/*
       * =================================================
       * 설명 Panel
       * =================================================
       */}
      <div
        className="nwax-guide-panel-anchor"
        style={
          panelStyle
        }
      >
        <section
          ref={
            panelRef
          }
          key={
            step.key
          }
          className="nwax-guide-panel"
          role="dialog"
          aria-modal="true"
          aria-label="NW AX 운영스퀘어 사용 가이드"
        >
          {/*
           * Header
           */}
          <div className="nwax-guide-top">
            <div className="nwax-guide-badge">
              <span>
                {step.icon ||
                  '✨'}
              </span>

              <span>
                {intro
                  ? 'TUTORIAL'
                  : outro
                    ? 'COMPLETE'
                    : step.group}
              </span>
            </div>

            {!outro && (
              <button
                type="button"
                className="nwax-guide-skip"
                onClick={
                  skip
                }
              >
                건너뛰기
              </button>
            )}
          </div>

          {/*
           * Progress
           */}
          {!intro &&
            !outro && (
              <div className="nwax-guide-progress">
                <span>
                  STEP{' '}
                  {step.step}{' '}
                  /{' '}
                  {step.total}
                </span>

                <div className="nwax-guide-track">
                  <span
                    style={{
                      width:
                        `${(
                          (
                            step.step ||
                            1
                          ) /
                          (
                            step.total ||
                            1
                          )
                        ) *
                          100}%`,
                    }}
                  />
                </div>
              </div>
            )}

          {/*
           * Title
           */}
          <h2 className="nwax-guide-title">
            <RichText
              text={
                step.title
              }
            />
          </h2>

          {/*
           * Body
           */}
          <div className="nwax-guide-body">
            {step.body.map(
              (
                text,
                bodyIndex
              ) => (
                <p
                  key={`${step.key}-${bodyIndex}`}
                >
                  <RichText
                    text={
                      text
                    }
                  />
                </p>
              )
            )}
          </div>

          {/*
           * Bullet
           */}
          {step.bullets && (
            <ul className="nwax-guide-bullets">
              {step.bullets.map(
                item => (
                  <li
                    key={
                      item
                    }
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
          )}

          {/*
           * Buttons
           */}
          <div className="nwax-guide-actions">
            {intro ? (
              <>
                <button
                  type="button"
                  className="nwax-guide-button nwax-guide-secondary"
                  onClick={
                    skip
                  }
                >
                  건너뛰기
                </button>

                <button
                  type="button"
                  className="nwax-guide-button nwax-guide-primary"
                  onClick={
                    next
                  }
                  disabled={
                    transitioning
                  }
                >
                  튜토리얼 시작 →
                </button>
              </>
            ) : outro ? (
              <button
                type="button"
                className="nwax-guide-button nwax-guide-primary nwax-guide-wide"
                onClick={
                  next
                }
              >
                운영스퀘어 시작하기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="nwax-guide-button nwax-guide-secondary"
                  onClick={
                    previous
                  }
                  disabled={
                    transitioning ||
                    index <= 0
                  }
                >
                  ← 이전
                </button>

                <button
                  type="button"
                  className="nwax-guide-button nwax-guide-primary"
                  onClick={
                    next
                  }
                  disabled={
                    transitioning
                  }
                >
                  {index ===
                  STEPS.length -
                    2
                    ? '튜토리얼 완료 →'
                    : '다음 →'}
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}