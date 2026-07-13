import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updatePoet } from "@/lib/poets/actions";
import { PoetForm } from "@/components/poet-form";

interface EditPoetPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPoetPage({ params }: EditPoetPageProps) {
  const { id } = await params;
  const poet = await db.poet.findUnique({ where: { id } });

  if (!poet) notFound();

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-normal"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Edit Poet
      </h1>
      <PoetForm
        action={updatePoet}
        defaultValues={{
          id: poet.id,
          name: poet.name,
          bio: poet.bio,
          imageUrl: poet.imageUrl,
        }}
      />
    </div>
  );
}
