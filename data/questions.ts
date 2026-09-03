import { Question } from "@/lib/types";

export const TEST_DURATION_MINUTES = 5;

// DMST — Digital Marketing Scholarship Test
// 25 questions, difficulty increasing in 4 bands:
//   Band 1 (Q1–7)   Very Easy      — full-forms & one-line definitions, for early motivation
//   Band 2 (Q8–14)  Easy-Medium    — same level as the original 20 (single-concept distinctions)
//   Band 3 (Q15–20) Medium         — scenario application (bounce rate, funnel stage, engagement)
//   Band 4 (Q21–25) Medium-High    — calculation + reasoning (still newbie-appropriate, no jargon)

export const SCHOLARSHIP_QUESTIONS: Question[] = [
  // ---------- BAND 1: VERY EASY (motivation) ----------
  {
    id: 1,
    text: "What does the term \"Digital Marketing\" primarily refer to?",
    category: "Digital Marketing Basics",
    options: [
      { key: "A", text: "Marketing done only through television and radio ads" },
      { key: "B", text: "Selling products only through physical retail stores" },
      { key: "C", text: "Promoting brands and services using internet and social platforms" },
      { key: "D", text: "A type of software used only for accounting" },
    ],
    correctAnswer: "C",
  },
  {
    id: 2,
    text: "What is the full form of SEO?",
    category: "SEO Fundamentals",
    options: [
      { key: "A", text: "Search Engine Optimization" },
      { key: "B", text: "Site Enhancement Operation" },
      { key: "C", text: "Search Engagement Online" },
      { key: "D", text: "System Engine Optimization" },
    ],
    correctAnswer: "A",
  },
  {
    id: 3,
    text: "What is the full form of SEM?",
    category: "SEM Fundamentals",
    options: [
      { key: "A", text: "Site Engagement Metrics" },
      { key: "B", text: "Social Engagement Marketing" },
      { key: "C", text: "Search Engine Management" },
      { key: "D", text: "Search Engine Marketing" },
    ],
    correctAnswer: "D",
  },
  {
    id: 4,
    text: "Which of the following is considered a digital marketing channel?",
    category: "Digital Marketing Basics",
    options: [
      { key: "A", text: "Only search engines like Google" },
      { key: "B", text: "Search engines, social media, and email" },
      { key: "C", text: "Only printed newspapers and flyers" },
      { key: "D", text: "Only television and radio commercials" },
    ],
    correctAnswer: "B",
  },
  {
    id: 5,
    text: "What is the full form of PPC?",
    category: "PPC Fundamentals",
    options: [
      { key: "A", text: "Pay-Per-Click" },
      { key: "B", text: "Post-Per-Content" },
      { key: "C", text: "Price-Per-Customer" },
      { key: "D", text: "Paid-Public-Campaign" },
    ],
    correctAnswer: "A",
  },
  {
    id: 6,
    text: "In simple terms, what does \"Content Marketing\" mean?",
    category: "Content Marketing",
    options: [
      { key: "A", text: "Designing a company's logo and colors" },
      { key: "B", text: "Managing a company's accounts and finances" },
      { key: "C", text: "Buying ad space in print newspapers" },
      { key: "D", text: "Creating content that attracts and engages people" },
    ],
    correctAnswer: "D",
  },
  {
    id: 7,
    text: "What is the main goal of Social Media Marketing?",
    category: "Social Media Marketing",
    options: [
      { key: "A", text: "To reduce a company's website loading speed" },
      { key: "B", text: "To manage a company's payroll system" },
      { key: "C", text: "To promote a brand and connect with its audience" },
      { key: "D", text: "To exclusively print physical brochures and flyers" },
    ],
    correctAnswer: "C",
  },

  // ---------- BAND 2: EASY-MEDIUM (original difficulty level) ----------
  {
    id: 8,
    text: "What is the key difference between SEO and SEM?",
    category: "SEO vs SEM",
    options: [
      { key: "A", text: "They are exactly the same thing" },
      { key: "B", text: "SEO drives organic traffic; SEM uses paid ads" },
      { key: "C", text: "SEM is used only for email campaigns" },
      { key: "D", text: "SEO applies only to social media platforms" },
    ],
    correctAnswer: "B",
  },
  {
    id: 9,
    text: "What does CTR (Click-Through Rate) measure?",
    category: "PPC & Metrics",
    options: [
      { key: "A", text: "The percentage of viewers who click on an ad" },
      { key: "B", text: "The total number of website visitors in a month" },
      { key: "C", text: "The total revenue earned from an ad campaign" },
      { key: "D", text: "The number of social media followers gained" },
    ],
    correctAnswer: "A",
  },
  {
    id: 10,
    text: "What is a \"Landing Page\" in digital marketing?",
    category: "Conversion Optimization",
    options: [
      { key: "A", text: "The homepage of any random company website" },
      { key: "B", text: "A page listing a company's job openings" },
      { key: "C", text: "The final page of a blog post" },
      { key: "D", text: "A page built for one campaign, with a single goal" },
    ],
    correctAnswer: "D",
  },
  {
    id: 11,
    text: "Which of the following is an example of On-Page SEO?",
    category: "On-Page SEO",
    options: [
      { key: "A", text: "Getting a backlink from another website" },
      { key: "B", text: "Running a paid Facebook ad campaign" },
      { key: "C", text: "Optimizing a page's title tag and content" },
      { key: "D", text: "Posting promotional content on social media" },
    ],
    correctAnswer: "C",
  },
  {
    id: 12,
    text: "What is a \"Backlink\" in SEO?",
    category: "Off-Page SEO",
    options: [
      { key: "A", text: "A link pointing to another page on your own website" },
      { key: "B", text: "A link from another website pointing to yours" },
      { key: "C", text: "A link that no longer works on a page" },
      { key: "D", text: "A link found only inside an email signature" },
    ],
    correctAnswer: "B",
  },
  {
    id: 13,
    text: "What is the main purpose of Keyword Research?",
    category: "SEO & Keywords",
    options: [
      { key: "A", text: "To find out what words people actually search for" },
      { key: "B", text: "To design the visual layout of a website" },
      { key: "C", text: "To write a company's privacy policy page" },
      { key: "D", text: "To randomly pick a website's domain name" },
    ],
    correctAnswer: "A",
  },
  {
    id: 14,
    text: "In Email Marketing, what does \"Open Rate\" tell you?",
    category: "Email Marketing",
    options: [
      { key: "A", text: "How many people unsubscribed from the list" },
      { key: "B", text: "The number of emails sent in a day" },
      { key: "C", text: "The number of new subscribers added this month" },
      { key: "D", text: "The percentage of recipients who opened the email" },
    ],
    correctAnswer: "D",
  },

  // ---------- BAND 3: MEDIUM (scenario application) ----------
  {
    id: 15,
    text: "If a webpage has a very high Bounce Rate, what does it most likely suggest?",
    category: "Web Analytics",
    options: [
      { key: "A", text: "The page is getting a lot of quality backlinks" },
      { key: "B", text: "The page has excellent conversion and sales rates" },
      { key: "C", text: "Visitors are leaving the page quickly after arriving" },
      { key: "D", text: "The page is ranking #1 on Google" },
    ],
    correctAnswer: "C",
  },
  {
    id: 16,
    text: "A brand wants to know how much revenue it earns for every rupee spent on ads. Which metric should it track?",
    category: "Performance Metrics",
    options: [
      { key: "A", text: "CTR (Click-Through Rate)" },
      { key: "B", text: "ROAS (Return on Ad Spend)" },
      { key: "C", text: "Open Rate (email metric)" },
      { key: "D", text: "Bounce Rate (website metric)" },
    ],
    correctAnswer: "B",
  },
  {
    id: 17,
    text: "Why do marketers use A/B Testing?",
    category: "Marketing Strategy",
    options: [
      { key: "A", text: "To compare two ad versions and see which performs better" },
      { key: "B", text: "To permanently pick one ad version without any data" },
      { key: "C", text: "To increase the listed price of every product" },
      { key: "D", text: "To block a competitor's website from ranking online" },
    ],
    correctAnswer: "A",
  },
  {
    id: 18,
    text: "A person discovers a brand for the first time through an Instagram ad but hasn't purchased anything yet. Which stage of the marketing funnel are they in?",
    category: "Marketing Funnel",
    options: [
      { key: "A", text: "Conversion" },
      { key: "B", text: "Retention" },
      { key: "C", text: "Consideration" },
      { key: "D", text: "Awareness" },
    ],
    correctAnswer: "D",
  },
  {
    id: 19,
    text: "Why would a business collaborate with a popular Instagram creator to promote its product?",
    category: "Influencer Marketing",
    options: [
      { key: "A", text: "To directly increase the website's server speed" },
      { key: "B", text: "To reduce the cost of website hosting" },
      { key: "C", text: "To leverage the creator's audience and their trust" },
      { key: "D", text: "To automatically improve the website's SEO rankings" },
    ],
    correctAnswer: "C",
  },
  {
    id: 20,
    text: "What does a high \"Engagement Rate\" on a social media post generally indicate?",
    category: "Social Media Marketing",
    options: [
      { key: "A", text: "The post was deleted shortly after posting" },
      { key: "B", text: "The post received strong interaction relative to its reach" },
      { key: "C", text: "The post was seen only by company employees" },
      { key: "D", text: "The post received zero comments or likes" },
    ],
    correctAnswer: "B",
  },

  // ---------- BAND 4: MEDIUM-HIGH (calculation + reasoning, still newbie-safe) ----------
  {
    id: 21,
    text: "A website receives 1,000 visitors in a month, and 50 of them make a purchase. What is the Conversion Rate?",
    category: "Performance Metrics",
    options: [
      { key: "A", text: "5%" },
      { key: "B", text: "50%" },
      { key: "C", text: "0.5%" },
      { key: "D", text: "20%" },
    ],
    correctAnswer: "A",
  },
  {
    id: 22,
    text: "What is the key difference between \"Organic Traffic\" and \"Paid Traffic\"?",
    category: "SEO Traffic",
    options: [
      { key: "A", text: "Organic traffic is always higher than paid traffic" },
      { key: "B", text: "Paid traffic only comes from email campaigns" },
      { key: "C", text: "There is no real difference between the two" },
      { key: "D", text: "Organic traffic is unpaid; paid traffic comes from ads" },
    ],
    correctAnswer: "D",
  },
  {
    id: 23,
    text: "Why are \"long-tail keywords\" (like \"best budget running shoes for beginners\") often recommended for someone new to SEO?",
    category: "SEO & Keywords",
    options: [
      { key: "A", text: "They have zero search volume, so they don't matter" },
      { key: "B", text: "They only work for paid ads, not for SEO" },
      { key: "C", text: "They are usually less competitive and more specific" },
      { key: "D", text: "They are not allowed to be used in SEO" },
    ],
    correctAnswer: "C",
  },
  {
    id: 24,
    text: "In Google Ads, what mainly determines a keyword's Quality Score?",
    category: "Google Ads",
    options: [
      { key: "A", text: "Only the total daily budget set by the advertiser" },
      { key: "B", text: "Ad relevance, expected click-through rate, and landing page experience" },
      { key: "C", text: "The number of employees at the company running the ad" },
      { key: "D", text: "The color scheme used in the ad creative" },
    ],
    correctAnswer: "B",
  },
  {
    id: 25,
    text: "A brand's email open rates are healthy, but very few people click the links inside the email. What does this most likely point to?",
    category: "Email Marketing",
    options: [
      { key: "A", text: "The content inside isn't compelling enough to click" },
      { key: "B", text: "The subject line itself is weak" },
      { key: "C", text: "The email service provider is broken" },
      { key: "D", text: "The brand has too many subscribers" },
    ],
    correctAnswer: "A",
  },
];
