import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/ui/Footer";
import { getAllSiteContent } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getAllSiteContent();

  return (
    <main className="relative">
      <Hero data={content.hero} />
      <About data={content.about} />
      <Skills data={content.skills} />
      <Projects data={content.projects} />
      <Experience data={content.experience} />
      <Contact />
      <Footer />
    </main>
  );
}
