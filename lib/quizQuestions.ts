// lib/quizQuestions.ts
// End-of-module quiz content. One question per module, kept server-side
// only (imported by app/api/questions/route.ts) so correct answers and
// free-text keywords never ship to the browser.
//
// Content below is drafted from each module's actual text (see
// app/api/modules/route.ts / the `documents` table) — double-check it
// against the current module copy and adjust wording/keywords as needed.
//
// free_text scoring: correct if the submitted answer contains ANY one
// of the listed keywords (case-insensitive substring match) — not all.

export type QuizQuestion =
  | {
      type: "multiple_choice";
      prompt: string;
      options: [string, string, string, string, string];
      correctIndex: number; // 0-based index into options
    }
  | {
      type: "true_false";
      prompt: string;
      correctAnswer: boolean;
    }
  | {
      type: "free_text";
      prompt: string;
      keywords: string[];
    };

export const QUIZ_QUESTIONS: Record<string, QuizQuestion> = {
  // --- Warehouse (Southern Cross Distribution) ---

  // Module 1: Company and Workplace Information
  mod1: {
    type: "multiple_choice",
    prompt:
      "Employees may have access to confidential information such as customer details, order information and inventory levels. According to the module, when is it okay to access or share this information?",
    options: [
      "Only for legitimate work purposes",
      "Any time, as long as it's shared with a coworker",
      "Whenever it helps you finish a task faster",
      "With friends or family outside of work, if they ask",
      "Only during your first week on the job",
    ],
    correctIndex: 0,
  },

  // Module 2: Warehouse Operations
  mod2: {
    type: "true_false",
    prompt:
      "True or False: If the warehouse system shows six units available but you can only locate four, you should update the inventory record yourself to say four so it matches what you found.",
    correctAnswer: false,
  },

  // Module 3: Safety, Security and Incident Reporting
  mod3: {
    type: "free_text",
    prompt:
      "If you receive a message asking you for your company password, what should you do?",
    keywords: ["verify", "report", "refuse", "decline", "not provide", "don't provide", "don't share", "do not share"],
  },

  // --- Software (Southern Cross Digital) ---

  // Module 1: Company and Engineering Workplace
  "mod-sw1": {
    type: "multiple_choice",
    prompt: "How should engineers treat feedback they receive during code reviews?",
    options: [
      "As a normal part of the development process, used to improve quality, security and maintainability",
      "As a personal criticism that should be dismissed",
      "As optional feedback that's safe to ignore before merging",
      "As a reason to argue with the reviewer in front of the team",
      "As irrelevant once the code passes automated tests",
    ],
    correctIndex: 0,
  },

  // Module 2: Development Tools and Engineering Workflow
  "mod-sw2": {
    type: "true_false",
    prompt:
      "True or False: When modifying a customer registration system, testing only the successful registration path is sufficient before merging the change.",
    correctAnswer: false,
  },

  // Module 3: Security, Data Protection and Production
  "mod-sw3": {
    type: "free_text",
    prompt:
      "If you accidentally commit a credential (like an API key or password) to a code repository, what should you do besides just deleting it?",
    keywords: ["report", "rotate", "revoke", "rotated", "revoked"],
  },
};
