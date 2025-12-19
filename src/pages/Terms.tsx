import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-bold mb-8 gradient-text">Terms of Service</h1>
          
          <p className="text-muted-foreground mb-6">
            Last updated: December 19, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using BugFindAI, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
            <p className="text-muted-foreground">
              BugFindAI provides AI-powered code analysis to detect bugs, security vulnerabilities, 
              and code quality issues. We offer suggestions for fixes but do not guarantee that all 
              issues will be detected or that suggested fixes will resolve all problems.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You are responsible for the code you submit for analysis</li>
              <li>Do not submit code containing malicious content</li>
              <li>Do not attempt to abuse or overload our service</li>
              <li>You must not use the service for illegal purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Intellectual Property</h2>
            <p className="text-muted-foreground">
              You retain all rights to the code you submit. BugFindAI does not claim ownership 
              of your code. Our service, including the AI models and analysis algorithms, 
              remains the intellectual property of BugFindAI.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              BugFindAI is provided "as is" without warranties of any kind. We are not liable 
              for any damages arising from the use of our service, including but not limited to 
              bugs not detected or issues caused by implementing suggested fixes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the 
              service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:support@bugfindai.com" className="text-primary hover:underline">
                support@bugfindai.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
