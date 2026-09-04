function ImpactSection() {
  return (
    <section className="border-y border-cyan-900 bg-cyan-950 px-4 py-12 text-white sm:px-6" aria-labelledby="impact-title">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Our impact</p>
          <h2 id="impact-title" className="mt-2 text-2xl font-bold sm:text-3xl">Keeping young people connected to learning and opportunity.</h2>
          <p className="mt-3 text-sm leading-7 text-cyan-50">BridgeEdu helps students find practical guidance, trusted opportunities, and mentors before barriers become dropouts.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="border-l-2 border-cyan-400 pl-4"><p className="text-2xl font-bold">5,000+</p><p className="mt-1 text-sm text-cyan-100">young people to reach</p></div>
          <div className="border-l-2 border-cyan-400 pl-4"><p className="text-2xl font-bold">3</p><p className="mt-1 text-sm text-cyan-100">core support pathways</p></div>
          <div className="border-l-2 border-cyan-400 pl-4"><p className="text-2xl font-bold">1</p><p className="mt-1 text-sm text-cyan-100">connected community</p></div>
        </div>
      </div>
    </section>
  )
}

export default ImpactSection