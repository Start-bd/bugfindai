# BugFindAI - Free AI Code Bug Scanner & Security Vulnerability Detector

> **Instantly scan your code for bugs, errors, and security vulnerabilities using AI. Get fix suggestions in seconds. Free to use — no signup required.**

[![Website](https://img.shields.io/badge/Website-bugfindai.com-2DFF71?style=for-the-badge)](https://bugfindai.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-95%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

---

## What is BugFindAI?

**BugFindAI** is an AI-powered code analysis tool that automatically detects bugs, security vulnerabilities, code quality issues, and logic errors in your source code. Simply paste your code or upload a file and receive an instant, detailed vulnerability report with actionable fix suggestions.

### Live Demo
**[https://bugfindai.com](https://bugfindai.com)**

---

## Key Features

- **AI Bug Detection** — Automatically find logic errors, null pointer exceptions, type mismatches, and runtime bugs
- **Security Vulnerability Scanning** — Detect SQL injection, XSS, buffer overflows, insecure dependencies, and OWASP Top 10 issues
- **Multi-Language Support** — JavaScript, TypeScript, Python, Java, C++, PHP, Ruby, Go, Rust, and more
- **Instant Fix Suggestions** — AI-generated, context-aware code fixes for every detected issue
- **Scan History** — Track and compare previous scans with full history
- **Export Reports** — Download scan results as PDF or JSON
- **No Signup Required** — Start scanning immediately for free
- **Privacy First** — Your code is analyzed securely and not stored permanently

---

## SEO Keywords This Tool Ranks For

`AI code bug scanner` · `free bug finder online` · `code vulnerability scanner` · `AI code review tool` · `security vulnerability detector` · `static code analysis` · `JavaScript bug finder` · `Python bug detector` · `TypeScript error checker` · `code quality analyzer` · `automated code review` · `AI debugging tool` · `find bugs in code online` · `free code security scanner` · `SQL injection scanner` · `XSS vulnerability checker` · `code error finder` · `AI code fixer`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Backend/Auth | Supabase |
| AI Integration | OpenAI / Gemini API |
| Analytics | Google Analytics 4 (consent-mode) |
| PWA | Service Worker + Web Manifest |

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm / bun

### Installation

```sh
# Clone the repository
git clone https://github.com/Start-bd/bugfindai.git

# Navigate to the project directory
cd bugfindai

# Install dependencies
npm install
# or with bun:
bun install
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```sh
cp .env.example .env
```

Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```sh
npm run dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```sh
npm run build
```

---

## How It Works

1. **Paste or Upload Code** — Support for direct code paste or file upload
2. **AI Analysis** — Advanced AI models perform deep static analysis
3. **Vulnerability Report** — Receive a detailed report with severity levels (Critical, High, Medium, Low)
4. **Fix Suggestions** — AI generates specific, actionable fixes for each issue
5. **Export & Share** — Download your report or save it to your history

---

## Supported Languages

| Language | Bug Detection | Security Scan | Fix Suggestions |
|----------|:---:|:---:|:---:|
| JavaScript | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ |
| Python | ✅ | ✅ | ✅ |
| Java | ✅ | ✅ | ✅ |
| C++ | ✅ | ✅ | ✅ |
| PHP | ✅ | ✅ | ✅ |
| Ruby | ✅ | ✅ | ✅ |
| Go | ✅ | ✅ | ✅ |
| Rust | ✅ | ✅ | ✅ |

---

## Security

- Never commit your `.env` file — it is listed in `.gitignore`
- Rotate Supabase keys regularly
- All API keys should be stored as environment variables
- Report security vulnerabilities to: security@bugfindai.com

---

## Contributing

Contributions are welcome! Please:

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Links

- **Website:** [https://bugfindai.com](https://bugfindai.com)
- **Scan Code Now:** [https://bugfindai.com/scan](https://bugfindai.com/scan)
- **Privacy Policy:** [https://bugfindai.com/privacy](https://bugfindai.com/privacy)
- **Terms of Service:** [https://bugfindai.com/terms](https://bugfindai.com/terms)

---

*BugFindAI — Making code safer, one scan at a time.*
