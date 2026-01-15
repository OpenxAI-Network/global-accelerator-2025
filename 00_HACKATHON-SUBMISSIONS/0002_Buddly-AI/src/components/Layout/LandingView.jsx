// src/components/Layout/LandingView.jsx
import ChatInput from "../Chat/ChatInput";

// SVG icons as components for cleanliness
const LogoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
);
const GitHubIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
);
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7v1A10.66 10.66 0 0 1 3 4S-1 13 8 17a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);


export default function LandingView({ onSend, isLoading }) {
    return (
        <div id="landing-view">
            <header className="landing-header">
                <div className="logo">
                    <LogoIcon />
                    <span>Buddly</span>
                </div>
                <div className="nav-icons">
                    <a href="https://github.com/Ashish-Patnaik" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <GitHubIcon />
                    </a>
                    <a href="https://x.com/ashdebugs" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                         <XIcon />
                    </a>
                    {/* <button type="button" aria-label="Toggle theme">
                        <XIcon />
                    </button> */}
                </div>
            </header>

            <main className="hero-content">
                <h1>
                    Build Fast. <span className="highlight">Design Bold.</span>
                    <br />
                    Edit Beautiful.
                </h1>
                <p>
                    Build & Imagine apps and websites by chatting with Buddly AI
                </p>

                <div className="landing-chat-input-wrapper">
                    <ChatInput onSend={onSend} isLoading={isLoading} />
                </div>
            </main>
        </div>
    );
}