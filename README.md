# Elgres Ceramics CRM

## 📌 Project Overview

This is a **Customer Relationship Management (CRM) system** developed for **Elgres Ceramics**. The project is built using **React (Vite)** with **Tailwind CSS** and Material UI for a responsive and modern UI. It integrates authentication, dashboard management, master data management, reports, and utility features to provide a seamless CRM experience.

## 🚀 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Material UI
- **State Management:** Context API / Custom Hooks
- **Routing:** React Router
- **Utilities:** Custom hooks for API calls, media queries, authentication handling
- **Build Tool:** Vite

## 📁 Project Structure

```
ag-solutions-bangalore-elgresceramics-crm/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── app/                # Main application logic
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard views
│   │   ├── home/           # Home page
│   │   ├── master/         # Master data management (buyers, categories, items, purchases, sales)
│   │   └── report/         # Reports section (Buyer Report, Stock Report)
│   ├── assets/             # Static assets (letterheads, signatures)
│   ├── components/         # Reusable UI components
│   │   ├── nav/            # Navigation components
│   │   ├── ui/             # UI components (buttons, forms, tables, etc.)
│   │   ├── spinner/        # Loading indicators
│   │   ├── toggle/         # Status toggle component
│   │   ├── ForgotPassword/ # Forgot password component
│   │   ├── loginAuth/      # Login authentication component
│   │   └── SessionTimeoutTracker/ # User session tracking
│   ├── config/             # Configuration files (Base URL, Button config)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility components (Context Panel, Helper functions)
│   ├── utils/              # Utility functions (Date handling, encryption)
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── json/                   # JSON data files
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

## 🎯 Features

✅ **Authentication** - Login, Logout, Session tracking  
✅ **Dashboard** - Overview of CRM activities  
✅ **Master Data Management** - Buyers, Categories, Items, Purchases, Sales  
✅ **Reports** - Generate and view reports on Buyers and Stock  
✅ **Responsive Design** - Optimized for mobile and desktop  
✅ **User Role Management** - Access control for different roles  
✅ **Custom UI Components** - Modals, Forms, Tables, and more  
✅ **API Integration** - Fetching and managing data from backend  
✅ **Performance Optimization** - Built using Vite for faster loading

## 🔧 Installation & Setup

Follow these steps to set up the project locally:

1. **Clone the repository:**

   ```sh
   git clone https://github.com/AG-Solutions-Bangalore/elgresceramics-crm
   cd elgresceramics-crm
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Run the development server:**

   ```sh
   npm run dev
   ```

4. **Build for production:**
   ```sh
   npm run build
   ```

## 🌍 Environment Variables

Create a `.env` file in the root directory and configure the following:

```
VITE_API_BASE_URL=<your-backend-api-url>
VITE_AUTH_SECRET=<your-secret-key>
```

## 📜 Code Style & Linting

This project follows **ESLint** and **Prettier** guidelines for clean code:

```sh
npm run lint  # Check for linting issues
npm run format  # Auto-format the code
```

## 📢 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`feature/your-feature-name`)
3. Commit your changes with descriptive messages
4. Push to the branch and create a Pull Request

## 🛠️ Troubleshooting

- If you encounter `module not found` errors, run:
  ```sh
  npm install
  ```
- If you experience caching issues, clear Vite cache:
  ```sh
  rm -rf node_modules/.vite
  ```

## 📝 License

This project is licensed under the **MIT License**.

---

💡 **For any queries, contact [(https://ag-solutions.in/)]** 🚀
