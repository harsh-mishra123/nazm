import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Poems", href: "/poems" },
  { label: "Poets", href: "/poets" },
  { label: "About", href: "/about" },
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ─── Fullscreen Video Background ─── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* ─── Navigation ─── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl tracking-tight text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          nazm<sup className="text-xs">®</sup>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
          <span>·</span>
          {NAV_LINKS.map((link) => (
            <span key={link.label} className="flex items-center gap-3">
              <Link
                href={link.href}
                className={`transition-colors ${
                  link.href === "/"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
              <span>·</span>
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/poems"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03] cursor-pointer"
        >
          Explore Poems
        </Link>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px]">
        {/* Headline */}
        <h1
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[1.05] tracking-[-2.46px] max-w-7xl font-normal"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          The shortest poem I know is a name.
        </h1>

        {/* Subtext (Couplet) */}
        <p className="animate-fade-rise-delay text-muted-foreground text-lg sm:text-2xl max-w-2xl mt-8 leading-relaxed font-light">
          हम ही उनके इश्क़ के क़ाबिल न थे
          <br />
          क्यूँ किसी ज़ालिम का शिकवा कीजिए
        </p>

        {/* CTA */}
        <Link
          href="/poems"
          className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 transition-transform hover:scale-[1.03] cursor-pointer"
        >
          Explore Poems
        </Link>
      </section>
    </div>
  );
}

