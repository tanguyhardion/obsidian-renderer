export interface TimelineEvent {
  date: string;
  title: string;
  content: string;
}

export const parseTimeline = (text: string): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  const eventRegex = /date:\s(.+)\ntitle:\s(.+)\ncontent:\n([\s\S]+?)(?=date:|$)/g;
  
  let match;
  while ((match = eventRegex.exec(text)) !== null) {
      const [, date, title, content] = match;
      events.push({ date, title, content });
  }

  return events;
}
