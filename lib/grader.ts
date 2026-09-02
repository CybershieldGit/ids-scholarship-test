import { StudentLead, Question, TestResultPayload } from "./types";

export function calculateTestResults(
  student: StudentLead,
  questions: Question[],
  userAnswers: Record<number, "A" | "B" | "C" | "D">,
  timeTakenSeconds: number,
  tabSwitchCount: number = 0
): TestResultPayload {
  const totalQuestions = questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let attemptedCount = 0;

  questions.forEach((q) => {
    const selected = userAnswers[q.id];
    if (selected !== undefined && selected !== null && selected !== ("" as any)) {
      attemptedCount += 1;
      if (selected === q.correctAnswer) {
        correctCount += 1;
      } else {
        wrongCount += 1;
      }
    }
  });

  const unattemptedCount = totalQuestions - attemptedCount;
  const scorePercentage = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(1)) : 0;

  return {
    full_name: student.full_name.trim(),
    phone: student.phone.trim(),
    email: student.email.trim(),
    city: student.city.trim(),
    qualification: student.qualification.trim(),
    total_questions: totalQuestions,
    attempted: attemptedCount,
    correct_answers: correctCount,
    wrong_answers: wrongCount,
    unattempted: unattemptedCount,
    score_percentage: scorePercentage,
    time_taken_seconds: Math.max(1, Math.round(timeTakenSeconds)),
    tab_switch_count: tabSwitchCount,
  };
}
