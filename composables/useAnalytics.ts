// composables/useAnalytics.ts
const { gtag } = useGtag();

export const useAnalytics = () => {
  const trackQuizStart = () => {
    gtag("event", "start_quiz", {
      event_category: "Quiz",
      event_label: "Quiz Started",
    });
  };

  const trackQuizFinish = () => {
    gtag("event", "finish_quiz", {
      event_category: "Quiz",
      event_label: "Quiz Finished",
    });
  };

  return {
    trackQuizStart,
    trackQuizFinish,
  };
};
