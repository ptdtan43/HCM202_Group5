import { ArrowRight, Flag, HeartHandshake, Sprout, Users } from 'lucide-react'
import image1 from '../assets/Section1.jpg'
import image2 from '../assets/Section2.jpg'
import image4 from '../assets/Section4.jpg'
import { forces, conditions, frontPrinciples, methods, partyFields } from './unityContent'
import './TheoryPage.css'

function Section({ id, title, children }) {
  return <section id={`phan-${id}`} aria-labelledby={`title-${id}`} className="theory-section">
    <header className="theory-section-heading"><span className="section-number" aria-hidden="true">{id}</span><h2 id={`title-${id}`}>{title}</h2></header>
    {children}
  </section>
}
function Photo({ src, alt, width, height, className = '' }) {
  return <img className={`theory-image ${className}`} src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
}
const icons = [Flag, Sprout, HeartHandshake, Users]
const labels = ['Lợi ích chung', 'Truyền thống', 'Khoan dung', 'Niềm tin']
const roles = ['Quy tụ mọi người', 'Tạo cơ sở gắn kết', 'Mở rộng đoàn kết', 'Phát huy sức mạnh nhân dân']
const results = ['Hiểu rõ quyền lợi, cùng chung nhận thức', 'Gắn kết mỗi người trong tổ chức phù hợp', 'Hợp sức thành khối đại đoàn kết']

export default function TheoryPage() {
  return <article className="theory-page">
    <header className="theory-hero">
      <p className="theory-eyebrow">Tư tưởng Hồ Chí Minh</p>
      <h1>Đại đoàn kết<br /><span>toàn dân tộc</span></h1>
      <p className="theory-intro">Sức mạnh của nhân dân, nền tảng cho thành công của cách mạng Việt Nam.</p>
    </header>
    <Section id="01" title="Vai trò của đại đoàn kết toàn dân tộc">
      <div className="role-feature">
        <Photo src={image1} alt="Chủ tịch Hồ Chí Minh cùng đồng bào các dân tộc" width="753" height="530" />
        <figure className="unity-quote"><span className="quote-mark" aria-hidden="true">“</span><blockquote>Đoàn kết, đoàn kết, đại đoàn kết.<br />Thành công, thành công, đại thành công.</blockquote><figcaption>Chủ tịch Hồ Chí Minh</figcaption></figure>
      </div>
      <div className="role-columns">
        <div><h3><span className="small-number">1.</span> Vấn đề chiến lược, quyết định thành công của cách mạng</h3><ul className="editorial-bullets"><li>Đại đoàn kết toàn dân tộc là vấn đề mang tính sống còn của dân tộc Việt Nam.</li><li>Trong mỗi giai đoạn cách mạng, đại đoàn kết toàn dân tộc là nhân tố quyết định sự thành bại của cách mạng.</li></ul></div>
        <div><h3><span className="small-number">2.</span> Mục tiêu và nhiệm vụ hàng đầu của cách mạng</h3><p>Đại đoàn kết không chỉ là khẩu hiệu chiến lược mà còn là mục tiêu lâu dài. Đảng phải xem việc xây dựng khối đại đoàn kết là nhiệm vụ hàng đầu trong mọi lĩnh vực:</p><ul className="party-fields">{partyFields.map(field => <li key={field}>{field}</li>)}</ul></div>
      </div>
      <aside className="unity-note"><p>Hồ Chí Minh xác định mục đích của Đảng Lao động Việt Nam bằng tám chữ:</p><strong>Đoàn kết toàn dân, phụng sự Tổ quốc.</strong></aside>
    </Section>
    <Section id="02" title="Lực lượng của khối đại đoàn kết toàn dân tộc">
      <div className="forces-layout">
        <div className="forces-copy"><p className="section-lead">Mọi người dân yêu nước đều là một phần của khối đại đoàn kết.</p><ul className="force-list">{forces.map(item => <li key={item.label}><h3>{item.label}</h3><p>{item.body}</p></li>)}</ul><p className="forces-conclusion">Lấy liên minh công nhân, nông dân và trí thức làm nền tảng để quy tụ rộng rãi mọi lực lượng.</p></div>
        <Photo src={image2} alt="Infographic các lực lượng trong khối đại đoàn kết: công nhân, nông dân, trí thức và các tầng lớp nhân dân" width="558" height="1000" className="forces-image" />
      </div>
    </Section>
    <Section id="03" title="Điều kiện xây dựng khối đại đoàn kết toàn dân tộc">
      <p className="section-description">Bốn điều kiện gắn bó với nhau, cùng tạo nên nền tảng của khối đại đoàn kết.</p>
      <div className="mind-map" role="group" aria-label="Sơ đồ tư duy: bốn điều kiện cùng xây dựng khối đại đoàn kết toàn dân tộc">
        <div className="mind-map-center"><Users size={28} aria-hidden="true" /><strong>Đại đoàn kết<br />toàn dân tộc</strong><span>Bốn điều kiện gắn kết</span></div>
        {conditions.map((item, index) => { const Icon = icons[index]; return <div className={`mind-node mind-node-${index + 1}`} key={item.title}><div className="mind-node-title"><Icon size={24} aria-hidden="true" /><h3>{labels[index]}</h3></div><strong className="condition-role">{roles[index]}</strong><p>{item.body}</p></div> })}
      </div>
      <p className="mind-map-summary">Có <strong>mục tiêu chung</strong> để quy tụ, có <strong>truyền thống</strong> để gắn kết, có <strong>khoan dung</strong> để mở rộng đoàn kết và có <strong>niềm tin</strong> để phát huy sức mạnh của nhân dân.</p>
    </Section>
    <Section id="04" title="Hình thức và nguyên tắc tổ chức: Mặt trận dân tộc thống nhất">
      <div className="front-feature"><Photo src={image4} alt="Ảnh tư liệu đội hình chiến sĩ đứng dưới lá cờ giữa núi rừng" width="670" height="500" /><div><h3>Quy tụ thành một khối thống nhất</h3><p>Mặt trận dân tộc thống nhất là nơi quy tụ mọi tổ chức và cá nhân yêu nước, tập hợp mọi người dân nước Việt, cả trong nước và kiều bào sinh sống ở nước ngoài.</p></div></div>
      <h3 className="principles-heading">Các nguyên tắc hoạt động cơ bản</h3><ol className="principles-list">{frontPrinciples.map((item, index) => <li key={item.title}><span className="principle-number" aria-hidden="true">{index + 1}</span><h4>{item.title}</h4><p>{item.body}</p></li>)}</ol>
    </Section>
    <Section id="05" title="Phương thức xây dựng khối đại đoàn kết dân tộc">
      <p className="section-description">Để hiện thực hóa khối đại đoàn kết, cần trải qua các bước và phương thức cụ thể:</p>
      <ol className="method-flow">{methods.map((item, index) => <li key={item.title}><div className="method-marker" aria-hidden="true">{index + 1}</div><div className="method-content"><h3>{item.title}</h3><p>{item.body}</p><div className="method-result"><ArrowRight size={18} aria-hidden="true" /><strong>{results[index]}</strong></div></div></li>)}</ol>
      <div className="flow-conclusion"><span>Kết quả</span><strong>Khối đại đoàn kết dân tộc vững mạnh</strong><p>Từ thống nhất nhận thức đến gắn kết tổ chức và phát huy sức mạnh chung.</p></div>
    </Section>
  </article>
}
