export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-16 py-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-text text-sm font-sans">
        <p>© {new Date().getFullYear()} LearnTrace. All rights reserved.</p>
        <div className="space-x-6 mt-3 md:mt-0">
          <a href="/privacy" className="hover:text-primary transition">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-primary transition">
            Terms of Service
          </a>
          <a href="/contact" className="hover:text-primary transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
