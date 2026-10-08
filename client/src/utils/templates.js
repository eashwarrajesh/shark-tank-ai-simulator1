/**
 * Pitch Templates for Quick Testing and Demo
 * Use these to quickly populate the pitch form with realistic startup data
 */

export const PITCH_TEMPLATES = {
  tutorlink: {
    id: 'tutorlink',
    name: 'TutorLink (EdTech)',
    data: {
      startupName: 'TutorLink',
      oneLiner: 'Uber for on-demand tutors for college students',
      problem: 'College students struggle to find qualified tutors on short notice, especially before exams. Current solutions are either too expensive, take days to respond, or lack quality verification. Students waste hours searching and often settle for mediocre help.',
      solution: 'TutorLink connects students with verified tutors in under 10 minutes. Our AI matching algorithm pairs students with tutors based on subject expertise, teaching style, and availability. All tutors are verified with grade transcripts and student reviews.',
      targetCustomer: 'College students aged 18-24 in tier 1 cities (Delhi, Mumbai, Bangalore) who need last-minute academic help',
      businessModel: '15% commission per tutoring session. Average session price is ₹500/hour. Students pay only after the session is completed.',
      competitiveAdvantage: 'AI-powered tutor matching with 10-minute response time guarantee, verified tutor credentials, and pay-after-session model that reduces student risk',
    },
  },
  fooddash: {
    id: 'fooddash',
    name: 'FoodDash (Food Delivery)',
    data: {
      startupName: 'FoodDash',
      oneLiner: 'Hyperlocal food delivery from home chefs within your apartment complex',
      problem: 'Working professionals in metro cities want home-cooked quality food but don\'t have time to cook. Restaurant delivery is expensive, takes 45+ minutes, and quality is inconsistent. Zomato/Swiggy fees are killing margins for small vendors.',
      solution: 'FoodDash connects apartment residents with home chefs living in the same complex or neighboring buildings. Food is delivered within 15 minutes because the chef is literally next door. Lower overhead means better prices for customers and better margins for chefs.',
      targetCustomer: 'Working professionals aged 25-40 living in gated communities in Bangalore, Mumbai, and Pune who value home-cooked meals',
      businessModel: '8% commission per order. Average order value is ₹150. Chefs pay ₹200/month for premium listing and analytics.',
      competitiveAdvantage: 'Delivery time under 15 minutes (vs 45+ on Swiggy), lower commission than competitors (8% vs 20-25%), and community trust through verified neighbor chefs',
    },
  },
  renteasy: {
    id: 'renteasy',
    name: 'RentEasy (PropTech)',
    data: {
      startupName: 'RentEasy',
      oneLiner: 'Digital rent payment platform with automated receipts and credit score building',
      problem: 'Tenants pay rent in cash or bank transfer with zero documentation trail. This makes it impossible to prove rental history for future landlords or build credit history. Landlords also struggle with late payments and manual receipt generation.',
      solution: 'RentEasy provides a UPI-based rent payment platform where every transaction is documented, auto-generates HRA-compliant receipts, and reports payment history to credit bureaus. Landlords get payment reminders, and tenants build rental credit.',
      targetCustomer: 'Urban renters aged 22-35 in metros who want to build credit history, plus landlords managing 2+ properties',
      businessModel: 'Freemium: Free for tenants. Landlords pay ₹99/month for premium features (auto-reminders, expense tracking, tenant screening). Transaction fee of ₹10 per rent payment.',
      competitiveAdvantage: 'First-mover in rental credit reporting, HRA-compliant receipts, integration with tax filing platforms like ClearTax',
    },
  },
  studypod: {
    id: 'studypod',
    name: 'StudyPod (EdTech SaaS)',
    data: {
      startupName: 'StudyPod',
      oneLiner: 'Notion for students — all-in-one study planner with AI-powered revision schedules',
      problem: 'Students juggle multiple apps for notes (OneNote), tasks (Todoist), timetables (Google Calendar), and flashcards (Quizlet). Context switching kills productivity. Existing tools are not built for academic workflows like semester planning, exam cycles, and revision tracking.',
      solution: 'StudyPod is a unified workspace built specifically for students. It combines notes, tasks, timetables, and flashcards in one place. Our AI analyzes your syllabus and exam dates to generate personalized revision schedules with spaced repetition.',
      targetCustomer: 'College students aged 18-24 and competitive exam aspirants (JEE, NEET, UPSC) who need structured study systems',
      businessModel: 'Freemium: Free for basic features. Premium at ₹199/month unlocks AI-powered revision scheduling, unlimited storage, and collaborative study groups. Annual plan at ₹1,499.',
      competitiveAdvantage: 'Built specifically for Indian academic system (semester structure, CGPA tracking), AI-powered revision with spaced repetition, works offline',
    },
  },
  blank: {
    id: 'blank',
    name: 'Start from Scratch',
    data: {
      startupName: '',
      oneLiner: '',
      problem: '',
      solution: '',
      targetCustomer: '',
      businessModel: '',
      competitiveAdvantage: '',
    },
  },
};

/**
 * Get a template by ID
 */
export const getTemplate = (templateId) => {
  return PITCH_TEMPLATES[templateId] || PITCH_TEMPLATES.blank;
};

/**
 * Get all template options for a dropdown
 */
export const getTemplateOptions = () => {
  return Object.values(PITCH_TEMPLATES).map(t => ({
    value: t.id,
    label: t.name,
  }));
};

/**
 * Example good and bad answers for reference
 */
export const ANSWER_EXAMPLES = {
  good: {
    acquisition: `We've already talked to 15 students in my college hostel. 8 said they'd pay ₹199/month if we launch next week. Our plan for the first 10 customers: (1) Convert those 8 pre-interested students in week 1, (2) Post in 3 specific college Facebook groups with 10,000+ members each, targeting exam season in week 2, (3) Offer the first month free to the first 50 signups to get testimonials. Based on our test post last week, we got 47 comments asking for the link.`,
    revenue: `Our revenue model is 15% commission per tutoring session. Average session is ₹500/hour, so we make ₹75 per session. To break even at ₹50,000/month expenses, we need 667 sessions per month, or about 22 sessions per day. Based on our pilot with 50 students last month, each active student books 2 sessions per week. So we need 170 active students to break even, which we plan to reach in month 3.`,
    competition: `Existing EdTech platforms like Vedantu and Chegg take 2-3 days to match students with tutors because they operate nationally. We focus only on metros and match within 10 minutes because we have hyperlocal tutor pools. A big platform can't copy this easily because: (1) They'd need to rebuild their matching algorithm for real-time, (2) Their existing tutors are spread across India and not available on-demand, (3) We're building marketplace liquidity in one city at a time, starting with Bangalore where we have 200 vetted tutors already.`,
  },
  bad: {
    acquisition: `We will use social media marketing and word of mouth. Our product is so good that people will naturally want to share it. We'll also do some influencer partnerships and maybe some Facebook ads.`,
    revenue: `We'll make money through commissions. Once we get big enough, the revenue will be huge because education is a massive market. We'll definitely be profitable within a year.`,
    competition: `We have no real competitors because nobody else is doing this exact thing. And even if they try, we'll just be faster and have better UX. We're first movers so we'll dominate.`,
  },
};

export default PITCH_TEMPLATES;
