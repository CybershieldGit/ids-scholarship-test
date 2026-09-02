export interface StudentLead {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  qualification: string;
}

export interface QuestionOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface Question {
  id: number;
  text: string;
  category?: string;
  options: QuestionOption[];
  correctAnswer: "A" | "B" | "C" | "D";
}

export interface TestResultPayload {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  qualification: string;
  total_questions: number;
  attempted: number;
  correct_answers: number;
  wrong_answers: number;
  unattempted: number;
  score_percentage: number;
  time_taken_seconds: number;
  tab_switch_count: number;
}
