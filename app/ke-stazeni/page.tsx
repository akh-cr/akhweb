import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FileList } from "@/components/file-list";

export default function KeStazeniPage() {
  const documents = [
    { name: "Stanovy AKH ČR", size: "166 KB", type: "pdf", url: "/documents/stanovy-akh-cr.pdf" },
    { name: "Přihláška do spolku AKH", size: "19 KB", type: "docx", url: "/documents/prihlaska-do-spolku-akh.docx" },
    { name: "Idea AKH ČR - prezentace", size: "413 KB", type: "pptx", url: "/documents/idea-akh-cr-prezentace.pptx" },
  ] as const;

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)]">
      <Navbar />
      
      {/* Header */}
      <section className="w-full py-20 bg-zinc-900 text-white text-center px-5">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Ke stažení</h1>
        <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
           Dokumenty a materiály spolku.
        </p>
      </section>
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-5 py-16">
        
        {/* Documents */}
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold border-b pb-4">Oficiální dokumenty</h2>
            <FileList files={documents} />
        </div>

      </div>

      <Footer />
    </main>
  );
}
