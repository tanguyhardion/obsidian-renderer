import styles from "./timeline.module.sass";
import { parseTimeline, TimelineEvent } from "../../utils/parse-timeline";
import Markdown from "react-markdown";
import wikiLinkPlugin from "remark-wiki-link";

interface TimelineProps {
  inputText: string;
}

export function Timeline({ inputText }: TimelineProps): JSX.Element {
  const events: TimelineEvent[] = parseTimeline(inputText);

  return (
    <div className={styles.timeline}>
      {events.map((event, index) => (
        <div className={styles.event} key={index}>
          <div
            className={styles.date}
            dangerouslySetInnerHTML={{ __html: event.date }}
          />
          <div className={styles.content}>
            <h3 className={styles.title}>{event.title}</h3>
            <p>
              <Markdown remarkPlugins={[[wikiLinkPlugin]]}>
                {event.content}
              </Markdown>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
