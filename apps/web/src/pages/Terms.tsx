import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Link } from "react-router-dom";

/**
 * Terms of service.
 *
 * Written against what the product actually does. Three points matter more
 * than the rest and are stated plainly rather than buried: no money moves
 * through the service, we are not a party to any agreement between a couple
 * and a vendor, and the service is in testing so nothing is guaranteed.
 *
 * LAST_UPDATED is shown to users and matters legally; bump it on any edit.
 */

const LAST_UPDATED = "28 August 2026";
const CONTACT_EMAIL = "hello@ajoyoapp.com";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-serif font-medium text-zinc-900 mb-3">{title}</h2>
    <div className="space-y-3 text-zinc-600 leading-relaxed">{children}</div>
  </section>
);

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-zinc-900 tracking-tight mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-zinc-500 mb-12">Last updated: {LAST_UPDATED}</p>

            <Section title="Agreement">
              <p>
                These terms govern your use of àjọyọ, a wedding planning service operating in
                Nigeria. By creating an account or using the service you agree to them. If you do
                not, please do not use the service.
              </p>
              <p>
                We may update these terms. If a change materially affects you we will tell you, and
                continuing to use the service after that means you accept the new version.
              </p>
            </Section>

            <Section title="The service is still in testing">
              <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
                àjọyọ is early software. Features may change or be withdrawn, data may occasionally
                be lost, and the service may be unavailable without notice. Please keep your own
                copy of anything you cannot afford to lose — particularly your guest list.
              </p>
              <p>
                We are not charging for the service at this time. Any prices shown on the pricing
                page describe plans we intend to offer; nothing is billed, and no plan limits are
                currently applied. If we begin charging, we will tell you first and you will be
                free to stop using the service.
              </p>
            </Section>

            <Section title="Your account">
              <p>
                You must be 18 or older. Give accurate information, keep your password to yourself,
                and tell us promptly if you think someone else has access to your account. You are
                responsible for what happens under it.
              </p>
              <p>
                Vendors and planners are reviewed before their accounts are approved. Approval means
                we have looked at the details supplied — it is not an endorsement, a verification of
                credentials, or a guarantee of the quality of anyone's work.
              </p>
            </Section>

            <Section title="What you put into the service">
              <p>
                Your content stays yours. Your story, photos, guest list, budget and everything else
                you enter belongs to you.
              </p>
              <p>
                To run the service we need permission to store and display it — to show your wedding
                website to the guests you share the link with, to send the invitations you ask us to
                send, and to show your workspace to a planner you have connected. That permission
                lasts as long as you keep the content on the service and ends when you delete it.
              </p>
              <p>
                Only upload things you have the right to upload, and keep it lawful and civil. We
                may remove content that breaks these terms or the law.
              </p>
            </Section>

            <Section title="Your guests' details">
              <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
                When you add guests, you are giving us other people's personal data. You are
                responsible for having a proper basis to do that and for telling them. We use it
                only to run your wedding — recording replies and sending the reminders you schedule.
              </p>
            </Section>

            <Section title="Vendors, planners and money">
              <p>
                àjọyọ is a place to find each other and keep track of what was agreed. Any agreement
                you reach with a vendor or planner is between you and them. We are not a party to
                it, we do not vet the work, and we cannot resolve a dispute about it.
              </p>
              <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
                No money moves through àjọyọ. Booking amounts and budgets you record here are your
                notes, not transactions. If you add bank details to your gift registry, they are
                published on your wedding website and guests pay you directly — we never see, hold
                or handle those payments.
              </p>
              <p>
                Vendors are responsible for the accuracy of their listings, prices and availability,
                and for delivering what they promise.
              </p>
            </Section>

            <Section title="Your public wedding website">
              <p>
                Anything you publish to your wedding website is visible to anyone with the link,
                including a search engine that finds it. That is what it is for — but publish
                accordingly, especially bank details and guest information.
              </p>
            </Section>

            <Section title="What you may not do">
              <ul className="list-disc pl-6 space-y-1">
                <li>use the service for anything unlawful, or to harass or impersonate anyone</li>
                <li>upload malware, or try to break, overload or gain unauthorised access to the service</li>
                <li>scrape or bulk-collect other people's data, including vendor listings</li>
                <li>send unsolicited marketing through our email features</li>
                <li>resell or pass off the service as your own</li>
              </ul>
            </Section>

            <Section title="Ending your use">
              <p>
                You can stop at any time and ask us to delete your account. We may suspend or close
                an account that breaks these terms, or that puts other people or the service at
                risk. Where it is reasonable to do so, we will tell you why.
              </p>
            </Section>

            <Section title="What we do not promise">
              <p>
                The service is provided as it is. We do not promise it will be uninterrupted,
                error-free, or fit for a particular purpose, and we do not warrant anything about
                the vendors or planners you find through it.
              </p>
              <p>
                To the extent the law allows, we are not liable for indirect or consequential loss,
                for lost profits or opportunities, or for any loss arising from an agreement between
                you and a vendor or planner. Nothing here limits liability that cannot lawfully be
                limited — including for death or personal injury caused by negligence, or for fraud.
              </p>
              <p>
                Since we do not currently charge for the service, our total liability to you is
                limited to any amount you have actually paid us, which at present is nothing.
              </p>
            </Section>

            <Section title="Privacy">
              <p>
                How we handle personal data is set out in our{" "}
                <Link className="underline" to="/privacy">Privacy Policy</Link>, which forms part of
                these terms.
              </p>
            </Section>

            <Section title="Governing law">
              <p>
                These terms are governed by the laws of the Federal Republic of Nigeria, and the
                courts of Nigeria have jurisdiction over any dispute arising from them.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about these terms: email{" "}
                <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or use
                our <Link className="underline" to="/contact">contact form</Link>.
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
