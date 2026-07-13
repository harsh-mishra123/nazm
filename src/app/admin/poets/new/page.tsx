import { createPoet } from "@/lib/poets/actions";
import { PoetForm } from "@/components/poet-form";

export default function NewPoetPage() {
  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-normal"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        New Poet
      </h1>
      <PoetForm action={createPoet} />
    </div>
  );
}
