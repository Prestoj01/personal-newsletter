/** Lightweight cross-component signal: anything on the page can ask the builder to add a topic. */
export const ADD_TOPIC_EVENT = "extra:add-topic";

export function requestAddTopic(topic: string) {
  window.dispatchEvent(new CustomEvent<string>(ADD_TOPIC_EVENT, { detail: topic }));
}
