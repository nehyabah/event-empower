import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Link } from "react-router-dom";

/**
 * Privacy policy.
 *
 * Written against what the code actually stores and who it actually sends data
 * to, rather than a template. If a table, a third party or a retention rule
 * changes, this page has to change with it — a policy that describes something
 * other than the real system is worse than none.
 *
 * LAST_UPDATED is shown to users and matters legally; bump it on any edit.
 */

const LAST_UPDATED = "27 August 2026";
const CONTACT_EMAIL = "privacy@ajoyoapp.com";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-serif font-medium text-zinc-900 mb-3">{title}</h2>
    <div className="space-y-3 text-zinc-600 leading-relaxed">{children}</div>
  </section>
);

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-zinc-900 tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-zinc-500 mb-12">Last updated: {LAST_UPDATED}</p>

            <Section title="Who we are">
              <p>
                àjọyọ̀ is a wedding planning service operating in Nigeria. This policy explains what
                personal data we collect, why we hold it, who else sees it, and what you can ask us
                to do with it.
              </p>
              <p>
                We process personal data in line with the Nigeria Data Protection Act 2023 (NDPA)
                and the Nigeria Data Protection Regulation. For the data you enter into your
                account, we are the data controller.
              </p>
            </Section>

            <Section title="What we collect">
              <p className="font-medium text-zinc-800">Your account</p>
              <p>
                Your name, email address, and password — stored only as a bcrypt hash, never in a
                form we can read. If you sign in with Google we receive your name, email address and
                profile picture from Google; we never see your Google password. Optionally your
                phone number and profile photo.
              </p>

              <p className="font-medium text-zinc-800 pt-2">If you are a vendor or planner</p>
              <p>
                Your business name, city, Instagram handle and WhatsApp number, plus anything you
                add to your public profile — description, photos, services and prices. This
                information is shown publicly in our vendor directory once your account is approved.
              </p>

              <p className="font-medium text-zinc-800 pt-2">Your wedding</p>
              <p>
                Partner names, wedding date, venue and location, budget and individual expenses,
                to-do lists, mood board images, and any notes you write.
              </p>

              <p className="font-medium text-zinc-800 pt-2">Your guests</p>
              <p>
                When you add guests we store their name, and where you provide them, their email
                address, phone number, party size and dietary notes. When a guest responds to an
                invitation we record their reply and the email address they give.
              </p>
              <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
                Your guests' details are personal data belonging to them, not to you. You are
                responsible for having a proper reason to share them with us, and for telling your
                guests that you have. We use them only to run your wedding — to record replies and
                to send the reminders you ask us to send.
              </p>

              <p className="font-medium text-zinc-800 pt-2">Bank details, if you add them</p>
              <p>
                If you set up a gift registry you can add bank account details — account name and
                number, and where relevant sort code, IBAN or SWIFT.
              </p>
              <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
                These are published on your wedding website so guests can send gifts, which means
                anyone with your website link can see them. That is what they are for, but please
                add them knowing they are public.
              </p>

              <p className="font-medium text-zinc-800 pt-2">Technical records</p>
              <p>
                We log administrative actions along with the IP address they came from, so we can
                investigate misuse. We use cookies only to keep you signed in — there is no
                advertising or third-party tracking on this service.
              </p>
              <p>
                We do not collect payment card details. There is no payment processing on the
                service at this time.
              </p>
            </Section>

            <Section title="Why we hold it, and on what basis">
              <p>
                Most of what we hold is there because we cannot provide the service without it —
                you cannot have a guest list without guests. Under the NDPA this is performance of
                our contract with you.
              </p>
              <p>
                We send transactional email — invitations, RSVP reminders you have scheduled,
                account notices — because you have asked us to. Newsletter emails are sent only if
                you separately opt in, and every one carries an unsubscribe link.
              </p>
              <p>
                We keep audit logs and moderate content on the basis of our legitimate interest in
                keeping the service secure and usable.
              </p>
            </Section>

            <Section title="Who else sees it">
              <p>
                We do not sell personal data, and we do not share it for advertising. We use a small
                number of service providers to run àjọyọ̀:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium text-zinc-800">Railway</span> — hosting, database and
                  file storage.
                </li>
                <li>
                  <span className="font-medium text-zinc-800">Brevo</span> — sending our email. They
                  receive the recipient's address and the message content.
                </li>
                <li>
                  <span className="font-medium text-zinc-800">Google</span> — only if you choose to
                  sign in with Google.
                </li>
              </ul>
              <p>
                Within the service, data is shared as you direct it: a planner you accept an
                invitation from can see that wedding's workspace, and a vendor you book can see the
                booking. Your wedding website and anything on it is public to anyone with the link.
              </p>
              <p>
                We may disclose data where the law requires it, or to establish or defend a legal
                claim.
              </p>
            </Section>

            <Section title="Where your data is held">
              <p>
                Our hosting and email providers store and process data on servers outside Nigeria,
                including in Europe. This means your personal data is transferred out of Nigeria.
              </p>
              <p>
                We rely on these providers' contractual data protection commitments for that
                transfer, and we only use providers that offer them. If you would like details of
                the safeguards in place, write to us at the address below.
              </p>
            </Section>

            <Section title="How long we keep it">
              <p>
                We keep your account and the data in it for as long as your account is open. If you
                ask us to delete your account we remove your personal data, except where we are
                required to keep something — for example a record of a transaction or a legal
                dispute.
              </p>
              <p>
                Audit logs are retained for security purposes. Guest records are removed when you
                delete them or when your account is deleted.
              </p>
            </Section>

            <Section title="Your rights">
              <p>Under the NDPA you may ask us to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>give you a copy of the personal data we hold about you</li>
                <li>correct anything inaccurate</li>
                <li>delete your data, where we have no obligation to keep it</li>
                <li>restrict or object to how we use it</li>
                <li>provide your data in a portable form</li>
                <li>withdraw consent, where our use rests on consent</li>
              </ul>
              <p>
                Write to <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and
                we will respond within 30 days. If you are not satisfied with our response, you can
                complain to the Nigeria Data Protection Commission.
              </p>
            </Section>

            <Section title="Keeping data safe">
              <p>
                Traffic to the service is encrypted in transit. Passwords are stored hashed.
                Sessions use signed tokens and expire. Access to production data is limited to
                people who need it.
              </p>
              <p>
                No service can promise perfect security. If a breach occurs that puts your rights at
                risk, we will notify the Nigeria Data Protection Commission and, where required,
                you.
              </p>
            </Section>

            <Section title="Children">
              <p>
                àjọyọ̀ is not intended for anyone under 18, and we do not knowingly collect data
                from children. If you believe a child has given us personal data, contact us and we
                will delete it.
              </p>
            </Section>

            <Section title="Changes to this policy">
              <p>
                If we change how we handle personal data we will update this page and the date at
                the top. Where a change materially affects you, we will tell you directly.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                For anything in this policy, including requests about your data, email{" "}
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

export default Privacy;
