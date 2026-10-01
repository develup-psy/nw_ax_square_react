import InformationContent from './post/InformationContent'
import NoticeContent from './post/NoticeContent'
import InsightContent from './post/InsightContent'

export default function PostMenu() {
  return (
    <section id="post-menu" className="post-menu-section">
      <div className="page-container">
        <div className="section-heading post-menu-heading">
          <span className="section-category section-category--information">INFORMATION</span>
          <h2 className="post-menu-title clamp-2">운영에 필요한 정보를 한눈에 확인하세요</h2>
        </div>

        <InformationContent />
        <div className="content-divider" />
        <NoticeContent />
        <div className="content-divider" />
        <InsightContent />
      </div>
    </section>
  )
}
