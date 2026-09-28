import ReactPlayer from 'react-player'

const videoData = {
  title: 'Video thuyết trình',
  subtitle: 'Video tóm tắt nội dung bài thuyết trình, được tạo bằng NotebookLM.',
  src: 'https://pub-5fffdec11f644b0fa58f1720464a2ae8.r2.dev/T%E1%BA%A7m_nh%C3%ACn_chi%E1%BA%BFn_l%C6%B0%E1%BB%A3c_HCM.mp4',
}

function VideoPage() {
  return (
    <section className="animate-fade-up w-full pt-16 sm:pt-20">
      <header className="mx-auto mb-10 max-w-5xl">
        <h1 className="font-serif text-5xl font-normal tracking-[-0.02em] text-ink sm:text-6xl lg:text-7xl">{videoData.title}</h1>
        <p className="mt-3 text-lg text-ink-soft sm:text-xl lg:text-2xl">{videoData.subtitle}</p>
      </header>

      <article className="mx-auto max-w-5xl">
        <div className="aspect-video overflow-hidden rounded-[2px] bg-ink">
          <ReactPlayer
            src={videoData.src}
            width="100%"
            height="100%"
            controls
            playsInline
          />
        </div>
      </article>
    </section>
  )
}

export default VideoPage