# EcoSense Architecture

## System Overview
EcoSense is a client-side React application with a lightweight Node.js proxy server.
All user data stays local (encrypted localStorage). AI features use Groq's llama-3.3-70b-versatile
model via a secure Express proxy that never exposes the API key to the browser.

```
┌────────────────────────────────────────────────────────┐
│                      Client Browser                     │
│                                                        │
│  ┌─────────────────┐             ┌──────────────────┐  │
│  │   React App     ├────────────►│  Zustand Store   │  │
│  │  (Vite + TS)    │             │  (Local State)   │  │
│  └────────┬────────┘             └────────┬─────────┘  │
│           │                               │            │
│           ▼                               ▼            │
│  ┌─────────────────┐             ┌──────────────────┐  │
│  │   Vite Proxy    │             │   AES Encrypted  │  │
│  │   (/api/chat)   │             │   LocalStorage   │  │
│  └────────┬────────┘             └──────────────────┘  │
└───────────┼────────────────────────────────────────────┘
            │
            ▼
┌───────────┴────────────────────────────────────────────┐
│                    Express Proxy Server                │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Injects process.env.GROQ_API_KEY                │  │
│  │  Rate Limiting (20 req/min)                      │  │
│  │  CORS Protection                                 │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │
                            ▼
               ┌──────────────────────────┐
               │    Groq API Services     │
               │ (llama-3.3-70b-versatile)│
               └──────────────────────────┘
```

## Data Flow
User Input → Zod Validation → Carbon Calculator → Zustand Store → LocalStorage (encrypted)
                                                      ↓
                                              Dashboard Charts + AI Insights

User Message → Sanitization → Proxy Server → Groq API → Streamed Response → Chat UI

## Carbon Calculation Model
Based on IPCC AR6 emission factors with Indian-specific adjustments:
- Indian electricity grid factor: 0.716 kg CO₂e/kWh (CEA 2023)
- Transport factors adjusted for Indian vehicle mix
- Food factors based on global LCA studies

## Security Model
- API keys: Server-side only, never in client bundle
- User data: AES-256 encrypted before localStorage write
- Input sanitization: HTML stripping + length limits before AI processing
- Rate limiting: 20 req/min per session on proxy server

## Accessibility
WCAG 2.1 AA compliant. Screen reader tested with NVDA + Chrome.
Full keyboard navigation. ARIA live regions for dynamic content.
