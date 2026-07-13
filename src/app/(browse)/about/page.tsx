import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — nazm",
  description: "Learn more about nazm, a digital space for quiet reflection and spoken poetry.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 py-8 sm:py-16">
      {/* Header */}
      <div className="space-y-4">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where words find their breath.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
          nazm is a digital sanctuary for poetry and recited verses. A minimalist space built for deep reflection, spoken word, and literary appreciation.
        </p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-8 pt-8 border-t border-border/30">
        <section className="space-y-4">
          <h2
            className="text-2xl text-foreground font-normal"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            The Concept
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In a world filled with constant noise and fleeting attention, poetry offers a return to stillness. nazm (meaning poetry or order in Urdu/Arabic) was created as a personal platform to organize and publish curated poems alongside recitations and recordings.
          </p>
        </section>

        <section className="space-y-4">
          <h2
            className="text-2xl text-foreground font-normal"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            The Experience
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every piece is presented with absolute clarity. Visitors can read the verses, watch recitations, and explore works categorized by theme and poet. For those who wish to save favorites, leave thoughts, or like specific pieces, a simple email authentication connects you to the community features.
          </p>
        </section>

        <section className="space-y-4">
          <h2
            className="text-2xl text-foreground font-normal"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Studio & Reach Us
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Whether you are a fellow creator, reader, or rebel, we welcome your presence. nazm is actively maintained as a solo labor of love. If you want to contribute recitations or reach out for collaboration, contact details will be featured here in subsequent updates.
          </p>
        </section>
      </div>
    </div>
  );
}
