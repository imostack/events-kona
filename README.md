# EventsKona

EventsKona is a **Next.js (React + TypeScript)** web application for creating, managing, and discovering events.  
It leverages **Next.js 15** for server-side rendering, **Tailwind CSS** for styling, and **Radix UI** for accessible, modern UI components.

## 🚀 Features
- Create and manage events
- User authentication (coming soon)
- Dynamic event pages with SEO optimization
- Responsive, accessible UI with Radix and Tailwind
- Deployed on **Vercel**

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (React 19 + TypeScript)
- **Styling:** Tailwind CSS 4 + tailwind-animate
- **UI Components:** Radix UI, Lucide React
- **State/Form Handling:** React Hook Form, Zod
- **Data Visualization:** Recharts
- **Deployment:** Vercel

## 🧩 Scripts
- `npm run dev` – start development server
- `npm run build` – build for production
- `npm start` – start production server

---

## 🧱 Folder Structure
events-kona/
│
├── .next/ # Next.js build output (auto-generated)
├── app/ # Application routes (App Router)
│ ├── create-event/ # Create Event page
│ ├── event/[id]/ # Event details page
│ ├── login/ # Authentication page
│ └── my-events/ # User’s event dashboard
│
├── components/ # Reusable UI components
├── hooks/ # Custom React hooks
├── lib/ # Helper functions and configurations
├── public/ # Static assets (images, icons, etc.)
├── styles/ # Global and module-based CSS files
├── package.json
└── README.md


---

## ⚙️ Available Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the project for production |
| `npm start` | Run the production build |
| `npm run lint` | Run lint checks |

---

## 💡 Getting Started

1. **Clone the repository**  
   ```bash
   git clone https://github.com/imostack/events-kona.git
   cd events-kona

Install dependencies

npm install


Start the development server

npm run dev


Open in browser

http://localhost:3000


🌐 Deployment

This project is hosted on Vercel, which supports automatic builds and deployments from GitHub.
For local production testing:

npm run build
npm start

🧩 Future Enhancements

🔑 User authentication (email and social logins)

💳 Event ticketing and payments integration

📡 Real-time event updates

📊 Admin dashboard and analytics

👨‍💻 Author

Imoyin Sampson
Product Designer | Frontend Developer

License

This project is under the MIT License | commercial usage without approval is prohibited
.