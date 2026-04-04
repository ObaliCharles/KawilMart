import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getResolvedSiteContent } from "@/lib/getSiteContent";

export const dynamic = "force-dynamic";

const AboutPage = async () => {
  const siteContent = await getResolvedSiteContent();
  const about = siteContent.aboutPage;

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-10 md:py-16 bg-[#faf7f2] min-h-screen">
        <div className="max-w-5xl mx-auto space-y-12">
          <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                {about.eyebrow}
              </p>
              <h1 className="text-4xl md:text-5xl leading-tight font-semibold text-gray-900">
                {about.title}
              </h1>
              <p className="text-lg text-gray-600 leading-8">
                {about.intro}
              </p>
            </div>

            <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.16em]">Why we exist</p>
              <p className="mt-4 text-gray-700 leading-7">{about.story}</p>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-5">
            {about.stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.5rem] bg-white border border-gray-100 p-6 shadow-sm">
                <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </section>

          <section className="rounded-[2rem] bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-[0.16em]">Our mission</p>
            <div className="mt-6 grid md:grid-cols-3 gap-5">
              {about.mission.map((item) => (
                <div key={item} className="rounded-2xl bg-orange-50/70 p-5 border border-orange-100">
                  <p className="text-gray-700 leading-7">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;
