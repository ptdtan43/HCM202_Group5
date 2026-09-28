import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const MotionDiv = motion.div
const MotionHeader = motion.header
const MotionSection = motion.section

const ease = [0.16, 1, 0.3, 1]
const reveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const theorySections = [
  {
    id: '01',
    title: 'Vai trò của đại đoàn kết toàn dân tộc',
    usePopup: false,
    preview: 'Đại đoàn kết là vấn đề có ý nghĩa chiến lược, quyết định thành công của cách mạng.',
  },
  {
    id: '02',
    title: 'Lực lượng của khối đại đoàn kết toàn dân tộc',
    usePopup: false,
    preview: 'Chủ thể bao gồm toàn thể nhân dân, nền tảng là liên minh công - nông - trí thức.',
  },
  {
    id: '03',
    title: 'Điều kiện xây dựng khối đại đoàn kết toàn dân tộc',
    usePopup: true,
    preview: 'Lấy lợi ích chung làm điểm quy tụ, khoan dung, độ lượng và có niềm tin vào nhân dân.',
  },
  {
    id: '04',
    title: 'Hình thức và nguyên tắc tổ chức : Mặt trận dân tộc thống nhất',
    usePopup: true,
    preview: 'Mặt trận dân tộc thống nhất là nơi quy tụ, tập hợp mọi tổ chức và cá nhân yêu nước.',
  },
  {
    id: '05',
    title: 'Phương thức xây dựng khối đại đoàn kết dân tộc',
    usePopup: true,
    preview: 'Làm tốt công tác dân vận, thành lập các đoàn thể và tập hợp trong Mặt trận.',
  },
]

const forces = [
  {
    label: 'Chủ thể của khối đại đoàn kết toàn dân tộc',
    body: (
      <>
        Bao gồm <strong className="font-semibold text-ink">toàn thể nhân dân</strong> Việt Nam yêu nước, không phân biệt
        giai cấp, tầng lớp, tôn giáo, đảng phái hay giới tính.
      </>
    ),
  },
  {
    label: 'Nền tảng của khối đại đoàn kết dân tộc',
    body: (
      <>
        Được xây dựng trên cơ sở <strong className="font-semibold text-ink">liên minh công nhân - nông dân - trí thức</strong>.
        Đây là "gốc" của đại đoàn kết.
      </>
    ),
  },
  {
    label: 'Hạt nhân lãnh đạo',
    body: 'Sự đoàn kết và thống nhất trong Đảng là yếu tố "hạt nhân" trong khối đại đoàn kết toàn dân tộc',
  },
]

const conditions = [
  {
    title: 'Lợi ích chung làm điểm quy tụ',
    body: 'Phải lấy độc lập, tự do, hạnh phúc của dân tộc làm mục tiêu chung, đồng thời tôn trọng các lợi ích khác biệt chính đáng.',
  },
  {
    title: 'Kế thừa truyền thống',
    body: 'Phát huy truyền thống yêu nước, nhân nghĩa, đoàn kết ngàn đời của dân tộc.',
  },
  {
    title: 'Khoan dung, độ lượng',
    body: 'Biết trân trọng phần thiện dù nhỏ nhất, không định kiến, cảm hóa cả những người từng lạc lối để quy tụ mọi lực lượng.',
  },
  {
    title: 'Niềm tin vào nhân dân',
    body: 'Quán triệt nguyên tắc "lấy dân làm gốc", tin tưởng tuyệt đối vào sức mạnh vô địch của quần chúng nhân dân.',
  },
]

const frontPrinciples = [
  {
    title: 'Nền tảng và lãnh đạo',
    body: 'Được xây dựng trên nền tảng liên minh công - nông - trí thức và đặt dưới sự lãnh đạo vững chắc của Đảng Cộng sản.',
  },
  {
    title: 'Hiệp thương dân chủ',
    body: 'Hoạt động dựa trên sự bàn bạc công khai, tôn trọng ý kiến của nhau để đi đến sự thống nhất chung.',
  },
  {
    title: 'Đoàn kết lâu dài, chân thành',
    body: (
      <>
        Thực hiện phương châm <em>"cầu đồng tồn dị"</em> (lấy cái chung lớn để hạn chế những khác biệt nhỏ), giúp đỡ nhau
        cùng tiến bộ.
      </>
    ),
  },
]

const methods = [
  {
    title: 'Công tác dân vận',
    body: 'Giáo dục, tuyên truyền, giải thích để quần chúng hiểu rõ quyền lợi. Phương pháp phải phù hợp tâm tư, trình độ, văn hóa và phong tục tập quán của nhân dân.',
  },
  {
    title: 'Thành lập các đoàn thể',
    body: 'Tổ chức các hội nhóm linh hoạt, phù hợp với từng giai cấp, lứa tuổi, nghề nghiệp (ví dụ: Công đoàn, Đoàn Thanh niên, Hội Phụ nữ...) để dễ dàng tập hợp và giáo dục.',
  },
  {
    title: 'Tập hợp trong Mặt trận',
    body: 'Các tổ chức quần chúng không hoạt động rời rạc mà được gắn kết lại thành một khối sức mạnh vô địch thông qua hệ thống Mặt trận dân tộc thống nhất.',
  },
]

const partyFields = ['Đường lối', 'Chủ trương', 'Chính sách', 'Hoạt động thực tiễn', 'Công tác vận động nhân dân']

function SubHeading({ index, children }) {
  return (
    <h3 className="flex items-baseline gap-3 text-lg leading-snug font-semibold text-ink sm:text-xl lg:text-[26px]">
      <span className="font-mono text-sm font-medium text-accent tabular-nums lg:text-lg">{index}</span>
      <span className="text-balance">{children}</span>
    </h3>
  )
}

function DashList({ items }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 leading-relaxed text-ink-soft lg:text-[22px]">
          <span aria-hidden="true" className="mt-[0.8em] h-px w-3 shrink-0 bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function NumberedRows({ items }) {
  return (
    <ol className="border-t border-rule">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-5 border-b border-rule py-5 sm:gap-8 sm:py-6 lg:py-7">
          <span className="w-7 shrink-0 font-serif text-3xl leading-none text-accent tabular-nums lg:w-9 lg:text-[42px]">{index + 1}</span>
          <div className="flex flex-col gap-1.5 lg:gap-2">
            <h4 className="text-lg font-semibold text-ink lg:text-[26px]">{item.title}</h4>
            <p className="leading-relaxed text-ink-soft lg:text-[22px]">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function SectionOneContent() {
  return (
    <div className="flex flex-col gap-10">
      <figure className="border-y border-rule py-8">
        <blockquote className="font-serif text-[26px] leading-[1.3] tracking-[-0.01em] text-balance text-ink italic sm:text-4xl lg:text-[46px]">
          <span aria-hidden="true" className="text-accent">“</span>
          Đoàn kết, đoàn kết, đại đoàn kết - Thành công, thành công, đại thành công
          <span aria-hidden="true" className="text-accent">”</span>
        </blockquote>
      </figure>

      <div className="flex flex-col gap-4">
        <SubHeading index="1.">Đại đoàn kết là vấn đề chiến lược, quyết định thành công của cách mạng</SubHeading>
        <DashList
          items={[
            'Đại đoàn kết toàn dân tộc là vấn đề mang tính sống còn của dân tộc Việt Nam',
            'Trong mỗi giai đoạn cách mạng, đại đoàn kết toàn dân tộc là nhân tố quyết định sự thành bại của cách mạng',
          ]}
        />
      </div>

      <div className="flex flex-col gap-4">
        <SubHeading index="2.">Đại đoàn kết là mục tiêu và nhiệm vụ hàng đầu của cách mạng</SubHeading>
        <p className="leading-relaxed text-ink-soft lg:text-[22px]">
          Đại đoàn kết không chỉ là khẩu hiệu chiến lược mà còn là mục tiêu lâu dài của cách mạng.
        </p>
        <p className="leading-relaxed text-ink-soft lg:text-[22px]">
          Đảng phải xem việc xây dựng khối đại đoàn kết là nhiệm vụ hàng đầu và thực hiện trong mọi lĩnh vực:
        </p>
        <ul className="flex flex-wrap gap-2">
          {partyFields.map((field) => (
            <li key={field} className="rounded-[4px] border border-rule px-3 py-1.5 text-sm text-ink lg:px-4 lg:py-2 lg:text-xl">
              {field}
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-rule pt-6">
          <p className="leading-relaxed text-ink-soft lg:text-[22px]">
            Hồ Chí Minh từng xác định mục đích của Đảng Lao động Việt Nam bằng tám chữ:
          </p>
          <p className="mt-2 font-serif text-2xl leading-snug text-accent sm:text-3xl lg:text-[42px]">Đoàn kết toàn dân, phụng sự Tổ quốc.</p>
        </div>
      </div>
    </div>
  )
}

function SectionTwoContent() {
  return (
    <dl className="border-t border-rule">
      {forces.map((item, index) => (
        <div key={item.label} className="grid grid-cols-1 gap-2 border-b border-rule py-6 sm:grid-cols-12 sm:gap-6">
          <dt className="flex gap-3 sm:col-span-5">
            <span className="font-mono text-sm text-accent lg:text-lg">{String.fromCharCode(97 + index)}.</span>
            <span className="font-serif text-xl leading-snug text-ink sm:text-2xl lg:text-[32px]">{item.label}</span>
          </dt>
          <dd className="leading-relaxed text-ink-soft sm:col-span-7 lg:text-[22px]">{item.body}</dd>
        </div>
      ))}
    </dl>
  )
}

function SectionThreeContent() {
  return (
    <div className="flex flex-col gap-6">
      <p className="leading-relaxed text-ink-soft lg:text-[22px]">
        Để xây dựng và củng cố khối đại đoàn kết, Chủ tịch Hồ Chí Minh đã chỉ ra 4 điều kiện cốt lõi:
      </p>
      <NumberedRows items={conditions} />
    </div>
  )
}

function SectionFourContent() {
  return (
    <div className="flex flex-col gap-8">
      <p className="font-serif text-2xl leading-snug text-balance text-ink sm:text-[28px] lg:text-[38px]">
        Mặt trận dân tộc thống nhất là nơi quy tụ mọi tổ chức và cá nhân yêu nước, tập hợp mọi người dân nước Việt, cả
        trong nước và kiều bào sinh sống ở nước ngoài
      </p>
      <div className="flex flex-col gap-4">
        <h4 className="font-mono text-xs tracking-[0.12em] text-muted uppercase lg:text-base">Các nguyên tắc hoạt động cơ bản</h4>
        <NumberedRows items={frontPrinciples} />
      </div>
    </div>
  )
}

function SectionFiveContent() {
  return (
    <div className="flex flex-col gap-6">
      <p className="leading-relaxed text-ink-soft lg:text-[22px]">
        Để hiện thực hóa khối đại đoàn kết, cần trải qua các bước và phương thức cụ thể:
      </p>
      <NumberedRows items={methods} />
    </div>
  )
}

const sectionContent = {
  '01': SectionOneContent,
  '02': SectionTwoContent,
  '03': SectionThreeContent,
  '04': SectionFourContent,
  '05': SectionFiveContent,
}

function SectionBody({ id }) {
  const Content = sectionContent[id]
  return Content ? <Content /> : null
}

function SectionModal({ section, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 cursor-pointer bg-ink/50"
      />
      <MotionDiv
        role="dialog"
        aria-modal="true"
        aria-labelledby="section-modal-title"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease }}
        className="relative flex max-h-[88vh] w-full max-w-3xl flex-col lg:max-w-5xl overflow-hidden rounded-[6px] border border-rule bg-paper"
      >
        <div className="flex shrink-0 items-start justify-between gap-6 border-b border-ink px-6 py-5 sm:px-10 sm:py-7">
          <div>
            <span className="font-mono text-xs tracking-[0.12em] text-accent lg:text-base">PHẦN {section.id}</span>
            <h2
              id="section-modal-title"
              className="mt-2 font-serif text-2xl leading-[1.15] font-normal tracking-[-0.01em] text-balance text-ink sm:text-[34px] lg:text-[46px]"
            >
              {section.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] text-muted transition-colors duration-200 hover:bg-ink/5 hover:text-ink active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
          <SectionBody id={section.id} />
        </div>
      </MotionDiv>
    </div>
  )
}

function TheorySection({ section, onOpen }) {
  const titleId = `phan-${section.id}-title`

  return (
    <MotionSection
      id={`phan-${section.id}`}
      data-section={section.id}
      aria-labelledby={titleId}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={reveal}
      transition={{ duration: 0.6, ease }}
      className="scroll-mt-28 border-b border-rule py-14 first:pt-2 sm:py-16"
    >
      <header className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-baseline sm:gap-8">
        <span className="font-serif text-5xl leading-none text-accent tabular-nums sm:w-20 sm:shrink-0 sm:text-6xl lg:w-24 lg:text-[76px]">
          {section.id}
        </span>
        <div>
          <span className="font-mono text-xs tracking-[0.12em] text-muted lg:text-base">PHẦN {section.id}</span>
          <h2
            id={titleId}
            className="mt-2 font-serif text-3xl leading-[1.15] font-normal tracking-[-0.015em] text-balance text-ink sm:text-[40px] lg:text-[52px]"
          >
            {section.title}
          </h2>
        </div>
      </header>

      <div className="sm:pl-28 lg:pl-32">
        {section.usePopup ? (
          <div className="flex flex-col items-start gap-6">
            <p className="max-w-[40em] text-lg leading-relaxed text-ink-soft lg:text-2xl">{section.preview}</p>
            <button
              type="button"
              onClick={() => onOpen(section)}
              className="inline-flex items-center gap-3 rounded-[4px] border border-ink px-5 py-3 font-medium text-ink transition-colors duration-200 hover:bg-ink hover:text-paper active:scale-[0.98] lg:px-7 lg:py-4 lg:text-xl"
            >
              Xem chi tiết
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
          </div>
        ) : (
          <SectionBody id={section.id} />
        )}
      </div>
    </MotionSection>
  )
}

function TableOfContents({ activeId, onNavigate }) {
  return (
    <nav aria-label="Mục lục" className="hidden lg:col-span-3 lg:block">
      <div className="sticky top-28 flex flex-col gap-5">
        <span className="font-mono text-xs tracking-[0.12em] text-muted lg:text-sm">MỤC LỤC</span>
        <ol className="flex flex-col border-t border-rule">
          {theorySections.map((section) => {
            const isActive = section.id === activeId
            return (
              <li key={section.id} className="border-b border-rule">
                <a
                  href={`#phan-${section.id}`}
                  onClick={() => onNavigate(section.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`flex gap-3 py-3 pr-2 text-sm leading-snug transition-colors duration-200 lg:py-3.5 lg:text-[17px] ${
                    isActive ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  <span className={`font-mono tabular-nums ${isActive ? 'text-accent' : ''}`}>{section.id}</span>
                  <span>{section.title}</span>
                </a>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

export default function TheoryPage() {
  const [activeSection, setActiveSection] = useState(null)
  const [activeId, setActiveId] = useState(theorySections[0].id)
  const closeModal = useCallback(() => setActiveSection(null), [])
  const spyLocked = useRef(false)

  const navigateTo = useCallback((id) => {
    spyLocked.current = true
    setActiveId(id)
  }, [])

  useEffect(() => {
    const sections = [...document.querySelectorAll('[data-section]')]
    let frame = 0
    let releaseTimer = 0

    // The last section can never scroll up to the reading line, so the page bottom counts as reaching it.
    const update = () => {
      frame = 0
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) {
        setActiveId(sections[sections.length - 1].dataset.section)
        return
      }
      const readingLine = window.innerHeight * 0.4
      let current = sections[0].dataset.section
      sections.forEach((el) => {
        if (el.getBoundingClientRect().top <= readingLine) current = el.dataset.section
      })
      setActiveId(current)
    }

    // After a table-of-contents click, keep the clicked item until the smooth scroll settles.
    const schedule = () => {
      if (spyLocked.current) {
        clearTimeout(releaseTimer)
        releaseTimer = setTimeout(() => {
          spyLocked.current = false
        }, 150)
        return
      }
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
      clearTimeout(releaseTimer)
    }
  }, [])

  return (
    <div className="pt-16 sm:pt-24">
      <MotionHeader
        initial="hidden"
        animate="visible"
        variants={reveal}
        transition={{ duration: 0.6, ease }}
        className="flex flex-col gap-6"
      >
        <span className="font-mono text-[13px] tracking-[0.14em] text-accent uppercase lg:text-base">Môn học: Tư tưởng Hồ Chí Minh</span>
        <h1 className="flex flex-col gap-3 font-serif font-normal">
          <span className="text-[28px] leading-[1.2] text-ink-soft italic sm:text-4xl lg:text-[48px]">Tư tưởng về</span>
          <span className="text-5xl leading-[1.05] tracking-[-0.025em] text-balance sm:text-7xl lg:text-[108px]">
            Đại đoàn kết toàn dân tộc
          </span>
        </h1>
        <p className="max-w-[40em] text-lg leading-relaxed text-ink-soft sm:text-xl lg:text-2xl">
          Phân tích chiến lược, lực lượng, điều kiện và phương thức xây dựng khối đại đoàn kết, nhằm đạt được mục tiêu chung
          của cách mạng Việt Nam.
        </p>
      </MotionHeader>

      <div className="mt-14 grid grid-cols-1 border-t border-ink pt-10 sm:mt-20 lg:grid-cols-12 lg:gap-x-6 lg:pt-14">
        <TableOfContents activeId={activeId} onNavigate={navigateTo} />
        <div className="lg:col-span-9">
          {theorySections.map((section) => (
            <TheorySection key={section.id} section={section} onOpen={setActiveSection} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeSection && <SectionModal section={activeSection} onClose={closeModal} />}
      </AnimatePresence>
    </div>
  )
}
