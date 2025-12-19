import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-bold mb-8 gradient-text">Privacy Policy</h1>
          
          <p className="text-muted-foreground mb-6">
            Last updated: December 19, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              When you use BugFindAI, we collect information you provide directly:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (email address) when you sign up</li>
              <li>Code snippets you submit for analysis (processed temporarily)</li>
              <li>Usage data and analytics to improve our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and maintain our code analysis service</li>
              <li>Save your scan history for logged-in users</li>
              <li>Improve and optimize our AI models and user experience</li>
              <li>Send service-related communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data. 
              Code submitted for analysis is processed securely and not shared with third parties.
              We do not store your code permanently unless you create an account and save it to your history.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Cookies and Analytics</h2>
            <p className="text-muted-foreground">
              We use Google Analytics to understand how users interact with our service. 
              This helps us improve BugFindAI. You can opt out of analytics tracking by using 
              browser extensions that block Google Analytics.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at{" "}
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

export default Privacy;
