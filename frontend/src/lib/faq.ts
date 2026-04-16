export type FaqItemInit = {
  id?: string;
  question: string;
  answer: string;
  order?: number;
};

export class FaqItem {
  readonly id?: string;
  readonly question: string;
  readonly answer: string;
  readonly order: number;

  constructor(init: FaqItemInit) {
    this.id = init.id;
    this.question = init.question.trim();
    this.answer = init.answer.trim();
    this.order = init.order ?? 0;
  }

  toJSON() {
    return {
      id: this.id,
      question: this.question,
      answer: this.answer,
      order: this.order,
    };
  }

  static from(init: FaqItemInit) {
    return new FaqItem(init);
  }
}

export function sortFaq(items: readonly FaqItem[]) {
  return [...items].sort((a, b) => (a.order - b.order) || a.question.localeCompare(b.question));
}

export function isFaqItem(value: unknown): value is FaqItemInit {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.question === "string" && typeof v.answer === "string";
}
