import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 p-6 shadow-2xl shadow-cyan-950/20 lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">BridgeEdu Rwanda</p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                Join a growing network of learners, mentors, and opportunity partners.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
                Discover opportunities, follow guided pathways, and connect with mentors who help young people grow in Rwanda and beyond.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/opportunities"
                  className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Explore opportunities
                </Link>
                <Link
                  to="/mentorship"
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  Become a mentor
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:min-w-[260px]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Need support?</p>
              <a href="mailto:hello@bridgeedu.rw" className="mt-2 block text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
                hello@bridgeedu.rw
              </a>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                We’re here to help students, mentors, and partners connect faster.
              </p>
              <div className="mt-4 flex gap-3">
                <Link to="/mentorship" aria-label="Mentorship network" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
                  in
                </Link>
                <a href="mailto:hello@bridgeedu.rw" aria-label="Email" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
                  ✉
                </a>
                <Link to="/pathways" aria-label="Resources" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
                  ↗
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/opportunities" className="transition hover:text-white">Opportunities</Link></li>
              <li><Link to="/pathways" className="transition hover:text-white">Pathways</Link></li>
              <li><Link to="/mentorship" className="transition hover:text-white">Mentorship</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Support</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="mailto:hello@bridgeedu.rw" className="transition hover:text-white">hello@bridgeedu.rw</a></li>
              <li><Link to="/mentorship" className="transition hover:text-white">Community network</Link></li>
              <li><Link to="/pathways" className="transition hover:text-white">Resources</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Why it matters</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Helping young people access the right opportunities, guidance, and mentorship at the right time.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-4 text-center text-sm text-slate-500 sm:px-6">
        © 2026 BridgeEdu Rwanda. Designed for student growth, mentorship, and opportunity access.
      </div>
    </footer>
  )
}

export default Footer
