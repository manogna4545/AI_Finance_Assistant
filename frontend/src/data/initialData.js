// Initial mock financial data for realistic presentation and testing

export const INITIAL_USER = {
  name: "Alex Morgan",
  email: "alex.morgan@finance.io",
  role: "Intern / Financial Analyst",
  currency: "$",
  monthlyIncomeGoal: 6500,
  monthlyBudget: 3800,
  notifications: true,
  theme: "light-green"
};

export const INITIAL_TRANSACTIONS = [
  {
    id: "tx-1",
    title: "Software Engineering Salary",
    amount: 4850.00,
    type: "income",
    category: "Salary",
    date: "2026-11-01",
    description: "Monthly base salary deposit",
    status: "Completed"
  },
  {
    id: "tx-2",
    title: "Apartment Rent",
    amount: 1450.00,
    type: "expense",
    category: "Housing",
    date: "2026-11-02",
    description: "Downtown 1BHK monthly rent",
    status: "Completed"
  },
  {
    id: "tx-3",
    title: "Whole Foods Organic Market",
    amount: 184.50,
    type: "expense",
    category: "Groceries",
    date: "2026-11-04",
    description: "Weekly fresh grocery haul",
    status: "Completed"
  },
  {
    id: "tx-4",
    title: "Freelance UI Consulting",
    amount: 850.00,
    type: "income",
    category: "Freelance",
    date: "2026-11-05",
    description: "Mobile app dashboard review",
    status: "Completed"
  },
  {
    id: "tx-5",
    title: "Electric & Water Utilities",
    amount: 142.30,
    type: "expense",
    category: "Utilities",
    date: "2026-11-06",
    description: "City utility municipal bill",
    status: "Completed"
  },
  {
    id: "tx-6",
    title: "Bistro Verde Dining",
    amount: 78.40,
    type: "expense",
    category: "Dining Out",
    date: "2026-11-08",
    description: "Team lunch celebration",
    status: "Completed"
  },
  {
    id: "tx-7",
    title: "Metro Transit Card Recharge",
    amount: 60.00,
    type: "expense",
    category: "Transportation",
    date: "2026-11-09",
    description: "Monthly transit pass recharge",
    status: "Completed"
  },
  {
    id: "tx-8",
    title: "Cloud & Dev Subscriptions",
    amount: 49.99,
    type: "expense",
    category: "Subscriptions",
    date: "2026-11-10",
    description: "AI API and GitHub Pro services",
    status: "Completed"
  },
  {
    id: "tx-9",
    title: "Pharmacy & Wellness",
    amount: 35.20,
    type: "expense",
    category: "Healthcare",
    date: "2026-11-11",
    description: "Vitamins and first aid essentials",
    status: "Completed"
  }
];

export const INITIAL_BUDGETS = [
  { id: "b-1", category: "Housing", limit: 1500, spent: 1450, color: "#059669" },
  { id: "b-2", category: "Groceries", limit: 500, spent: 340, color: "#10b981" },
  { id: "b-3", category: "Dining Out", limit: 300, spent: 285, color: "#f59e0b" },
  { id: "b-4", category: "Transportation", limit: 180, spent: 110, color: "#3b82f6" },
  { id: "b-5", category: "Utilities", limit: 200, spent: 142, color: "#8b5cf6" },
  { id: "b-6", category: "Subscriptions", limit: 100, spent: 90, color: "#ec4899" },
  { id: "b-7", category: "Healthcare", limit: 150, spent: 45, color: "#14b8a6" }
];

export const MONTHLY_TREND_DATA = [
  { month: "Jun", income: 5100, expenses: 2600, savings: 2500 },
  { month: "Jul", income: 5300, expenses: 2850, savings: 2450 },
  { month: "Aug", income: 5200, expenses: 2700, savings: 2500 },
  { month: "Sep", income: 5800, expenses: 3100, savings: 2700 },
  { month: "Oct", income: 5600, expenses: 2950, savings: 2650 },
  { month: "Nov (Est)", income: 5700, expenses: 2545, savings: 3155 }
];

export const PREDICTION_FORECAST_DATA = [
  { month: "Sep", actual: 3100, predicted: null, lower: null, upper: null, confidence: "Historical" },
  { month: "Oct", actual: 2950, predicted: null, lower: null, upper: null, confidence: "Historical" },
  { month: "Nov (Current)", actual: 2545, predicted: 2650, lower: 2400, upper: 2850, confidence: "94% Confident" },
  { month: "Dec (Projected)", actual: null, predicted: 2890, lower: 2600, upper: 3180, confidence: "88% Confident" },
  { month: "Jan (Projected)", actual: null, predicted: 2720, lower: 2450, upper: 3050, confidence: "82% Confident" },
  { month: "Feb (Projected)", actual: null, predicted: 2640, lower: 2320, upper: 2980, confidence: "79% Confident" }
];

export const CATEGORY_COLORS = {
  Salary: "#059669",
  Freelance: "#10b981",
  Investment: "#34d399",
  Housing: "#047857",
  Groceries: "#16a34a",
  "Dining Out": "#f59e0b",
  Transportation: "#2563eb",
  Utilities: "#7c3aed",
  Subscriptions: "#db2777",
  Healthcare: "#0d9488",
  Entertainment: "#e11d48",
  Shopping: "#ea580c",
  Other: "#64748b"
};

export const INITIAL_AI_CHAT = [
  {
    id: 1,
    sender: "assistant",
    time: "10:30 AM",
    message: "Hello Alex! I am your AI Finance Assistant. I monitor your income, spending habits, and upcoming budget thresholds. How can I help optimize your money today?"
  },
  {
    id: 2,
    sender: "user",
    time: "10:31 AM",
    message: "How is my spending looking for Dining Out this month?"
  },
  {
    id: 3,
    sender: "assistant",
    time: "10:31 AM",
    message: "You have spent $285.00 out of your $300.00 Dining Out budget (95% used) with 18 days remaining. I recommend limiting restaurant dinners to stay within your targets and save an extra $95 this month."
  }
];
