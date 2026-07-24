function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]">
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">{children}</main>
    </div>
  )
}

export default AppLayout
