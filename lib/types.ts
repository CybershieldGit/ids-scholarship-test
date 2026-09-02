export interface StudentLead {
  lead_id?: string;
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
  action?: "INIT_LEAD" | "UPDATE_TEST_RESULT";
  lead_id?: string;
  status?: string;
  full_name: string;
  phone: string;
  email: string;
  city: string;
  qualification: string;
  total_questions: number;
  attempted: number | string;
  correct_answers: number | string;
  wrong_answers: number | string;
  unattempted: number | string;
  score_percentage: number | string;
  time_taken_seconds: number | string;
  tab_switch_count: number | string;
}
