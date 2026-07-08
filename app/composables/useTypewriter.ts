import { ref, onMounted, onUnmounted } from 'vue';

export const useTypewriter = (
  words: string[],
  options: {
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
  } = {}
) => {
  const {
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000,
  } = options;

  const displayedText = ref('');
  const currentWordIndex = ref(0);
  const isDeleting = ref(false);
  const isPaused = ref(false);
  
  let timeoutId: NodeJS.Timeout | null = null;

  const type = () => {
    const currentWord = words[currentWordIndex.value];
    
    if (isPaused.value) {
      timeoutId = setTimeout(() => {
        isPaused.value = false;
        isDeleting.value = true;
        type();
      }, pauseDuration);
      return;
    }

    if (isDeleting.value) {
      // Effacement
      if (displayedText.value.length > 0) {
        displayedText.value = currentWord.substring(0, displayedText.value.length - 1);
        timeoutId = setTimeout(type, deletingSpeed);
      } else {
        // Passer au mot suivant
        isDeleting.value = false;
        currentWordIndex.value = (currentWordIndex.value + 1) % words.length;
        timeoutId = setTimeout(type, 500);
      }
    } else {
      // Écriture
      if (displayedText.value.length < currentWord.length) {
        displayedText.value = currentWord.substring(0, displayedText.value.length + 1);
        timeoutId = setTimeout(type, typingSpeed);
      } else {
        // Pause avant d'effacer
        isPaused.value = true;
        timeoutId = setTimeout(type, pauseDuration);
      }
    }
  };

  const start = () => {
    if (words.length > 0) {
      type();
    }
  };

  const stop = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  onMounted(() => {
    start();
  });

  onUnmounted(() => {
    stop();
  });

  return {
    displayedText,
    start,
    stop,
  };
};
