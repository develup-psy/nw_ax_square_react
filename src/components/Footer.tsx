import type { CSSProperties } from 'react'
import { ArrowIcon, MonitorIcon } from './icons'
import { PINK } from '../constants/theme'
import { COPILOT_URL, STUDIO_URL } from '../constants/links'

import postingBuilderIcon
  from '../assets/images/nw_ax_icon.svg';

type ServiceStyle = CSSProperties & {
  '--service-color'?: string
}

const SERVICES = [
  { key: 'confluence', label: 'Confluence', short: 'C', color: '#0277BD', href: 'https://lgucorp.atlassian.net/wiki/spaces/yuE2EYBu1YuB' },
  { key: 'jira', label: 'Jira', short: 'J', color: '#0052CC', href: 'https://lgucorp.atlassian.net/jira/core/projects/NWAX/board?filter=&groupBy=none' },
  { key: 'copilot', label: 'Copilot', short: '✦', color: PINK, href: COPILOT_URL },
  { key: 'sharepoint', label: 'SharePoint', short: 'S', color: '#038387', href: '#' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-tools">
        <div className="page-container footer-tools-inner">
          <div className="footer-tools-heading">
            <div className="footer-kicker">NW AX추진팀 · 업무 지원 도구</div>
            <h3 className="footer-tools-title">업무를 더 편리하게 만들어주는 도구</h3>
            <p className="footer-tools-description">운영 중 필요한 정보를 찾거나 게시물을 작성할 때 활용할 수 있는 도구입니다.</p>
          </div>

          <div className="footer-tool-grid">
            <a className="footer-tool-card" href={COPILOT_URL} target="_blank" rel="noreferrer">
              <div className="footer-tool-icon footer-tool-icon--copilot">✦</div>
              <div className="footer-tool-copy">
                <strong>RPA Agent</strong>
                <span>운영 업무 중 궁금한 내용을 Copilot에게 질문하고 필요한 정보를 빠르게 확인하세요.</span>
              </div>
              <div className="footer-tool-action">RPA Agent에게 물어보기 <ArrowIcon /></div>
            </a>

            <a className="footer-tool-card" href={STUDIO_URL}>
              <div className="footer-tool-icon footer-tool-icon--studio">✎</div>
              <div className="footer-tool-copy">
                <strong>NW AX Square Studio</strong>
                <span>원하는 컴포넌트를 조합해 별도의 디자인 작업 없이 게시물을 쉽고 빠르게 작성하세요.</span>
              </div>
              <div className="footer-tool-action">게시물 작성하기 <ArrowIcon /></div>
            </a>
          </div>
        </div>
      </div>

      <div className="page-container footer-main">
        <div className="footer-brand">
          <div className="footer-brand-icon">
            <img
                  src={postingBuilderIcon}
                  alt=""
                />
          </div>
          <div className="footer-brand-copy">
            <div className="footer-title clamp-1">NW AX 운영스퀘어</div>
            <div className="footer-description clamp-2">NW AX추진팀 · RPA 운영 업무를 위한 통합 지원 플랫폼</div>
          </div>
        </div>

        <div className="footer-services">
          {SERVICES.map(service => {
            const style: ServiceStyle = { '--service-color': service.color }
            return (
              <a className="footer-service" key={service.key} href={service.href} title={service.label} target="_blank" rel="noreferrer">
                <span className="footer-service-icon" style={style}>{service.short}</span>
                <span className="footer-service-label clamp-1">{service.label}</span>
              </a>
            )
          })}
        </div>
      </div>

      <div className="footer-copyright">© 2026 LG U+ NW AX추진팀. All rights reserved.</div>
    </footer>
  )
}
