<script setup lang="ts">
import type { Question } from '~/types/question';
const { trackQuizStart, trackQuizFinish } = useAnalytics();

useHead({
    title: 'Quiz sur le Sénégal | Vie-Publique.sn',
    meta: [
        {
            name: 'description',
            content: 'Jeux Quiz culture général sur le Sénégal'
        },
        // Twitter Card Meta Tags
        {
            name: "twitter:title",
            content: "Quiz sur le gouvernement du Sénégal | Vie-Publique.sn",
        },
        {
            name: "twitter:description",
            content: "Jeux Quiz sur le Sénégal et le gouvernement du Sénégal",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "/quiz-1.png" },
        // Open Graph Meta Tags
        {
            property: "og:title",
            content:
                "Jeux Quiz sur le Sénégal | vie-publique.sn",
        },
        {
            property: "og:description",
            content: "Jeux Quiz sur le Sénégal et le gouvernement du Sénégal",
        },
        { property: "og:image", content: "/quiz-1.png" },
        { property: "og:url", content: "https://vie-publique.sn/quiz" },
        { property: "og:type", content: "website" },
    ]
})

/* Get Datas */

const { data: textQuestions } = await useFetch('/api/quiz-text')
const { data: imageQuestions } = await useFetch('/api/quiz-image')

/* State */
const userAnswers = ref<Array<string | null>>(Array(0).fill(null))
const feedback = ref<Array<boolean | null>>(Array(0).fill(null))
const isQuizCompleted = ref(false)
const correctAnswersCount = ref(0)
const currentQuestions = ref<Question[]>([])
const questionsLoaded = ref(false)
const currentQuestionIndex = ref(0)
const isAnswered = ref(false)
const isQuizStarted = ref(false)
const selectedQuizType = ref<string | null>(null)

const shuffleArray = (array: Question[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

const initializeQuiz = () => {
    let questions = selectedQuizType.value === 'text' ? textQuestions.value : imageQuestions.value
    if (questions && questions.length > 0) {
        currentQuestions.value = shuffleArray([...questions]).slice(0, 10)
        userAnswers.value = Array(currentQuestions.value.length).fill(null)
        feedback.value = Array(currentQuestions.value.length).fill(null)
        isQuizCompleted.value = false
        correctAnswersCount.value = 0
        questionsLoaded.value = true
        currentQuestionIndex.value = 0
        isAnswered.value = false
        isQuizStarted.value = false
    }
}

const provideFeedback = (index: number) => {
    feedback.value[index] = userAnswers.value[index] === currentQuestions.value[index].answer
    isAnswered.value = true
}

const selectOption = (option: string) => {
    if (!isAnswered.value) {
        userAnswers.value[currentQuestionIndex.value] = option
        provideFeedback(currentQuestionIndex.value)
    }
}

const nextQuestion = () => {
    if (currentQuestionIndex.value < currentQuestions.value.length - 1) {
        currentQuestionIndex.value++
        isAnswered.value = false
    }
}

const finishQuiz = () => {
    correctAnswersCount.value = userAnswers.value.filter((answer, index) => answer === currentQuestions.value[index].answer).length;
    isQuizCompleted.value = true;
    trackQuizFinish();
}

const isAnswerCorrect = (index: number) => {
    return userAnswers.value[index] === currentQuestions.value[index].answer
}

const restartQuiz = () => {
    selectedQuizType.value = null
    initializeQuiz()
}

const startQuiz = () => {
    isQuizStarted.value = true;
    trackQuizStart();
}

const selectQuizType = (type: string) => {
    console.log("'electQuizType: 'selectQuizType");
    selectedQuizType.value = type
    initializeQuiz()
    startQuiz()
}

onMounted(() => {
    initializeQuiz()
})

useMotion()

</script>

<template>
    <div class="container mx-auto px-4 sm:px-8">

        <div class="prose prose-sm sm:prose mx-auto my-2">
            <h1 class="text-center">Quiz
                <span v-if="selectedQuizType === 'text'">Organisation de l'État</span>
                <span v-else-if="selectedQuizType === 'image'">Photos nominations</span>
            </h1>
        </div>

        <div v-if="!selectedQuizType">
            <div class="p-4 text-center mb-2 ">
                <p>Question pour un citoyen Champion</p>
                <p>Sélectionnez un Quiz et testez vos connaissances sur le gouvernement du Sénégal</p>
            </div>

            <!-- <div class="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4"> -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UCard class="text-center cursor-pointer custom-shadow" @click="selectQuizType('text')">
                    <img src="~/assets/images/quiz_logo_1.jpg" alt="Quiz Organisation de l'Etat" loading="lazy"
                        width="100" height="100" class="mx-auto" />
                    <div class="p-2">
                        <p class="text-lg font-semibold mb-2">Quiz Organisation de l'état</p>
                        <!-- <UButton @click="selectQuizType('text')" class="text-center w-full rounded-3xl"
                                label="Jouer" size="xl" icon="i-heroicons-play" color="black" /> -->
                    </div>
                </UCard>
                <UCard class="text-center cursor-pointer custom-shadow" @click="selectQuizType('image')">
                    <img src="~/assets/images/quiz_logo_2.jpg" alt="Quiz Photos nominations" loading="lazy" width="100"
                        height="100" class="mx-auto" />
                    <div class="p-2">
                        <p class="text-lg font-semibold mb-2">Quiz Photos nominations</p>
                        <!-- <UButton @click="selectQuizType('image')" class="text-center w-full rounded-3xl "
                                label="Jouer" size="xl" icon="i-heroicons-play" color="black" /> -->
                    </div>
                </UCard>
            </div>

        </div>



        <div v-else-if="questionsLoaded && isQuizStarted">
            <div v-if="!isQuizCompleted">
                <UCard class="p-4 custom-shadow card-question" v-motion>

                    <div class="text-sm text-center text-gray-500 mb-2">
                        Question {{ currentQuestionIndex + 1 }} / {{ currentQuestions.length }}
                    </div>
                    <UProgress :value="currentQuestionIndex + 1" :max="currentQuestions.length" size="md"
                        color="black" />

                    <p class="text-lg text-center font-semibold my-2">
                        {{ currentQuestions[currentQuestionIndex].question }}
                    </p>

                    <div v-if="selectedQuizType === 'text'">
                        <div v-for="(option, index) in currentQuestions[currentQuestionIndex].options" :key="option"
                            class="mb-1">
                            <UCard :class="{
                                'bg-quiz': userAnswers[currentQuestionIndex] !== option,
                                'bg-emerald-600 text-white': feedback[currentQuestionIndex] !== null && option === currentQuestions[currentQuestionIndex].answer,
                                'bg-rose-600 text-white': feedback[currentQuestionIndex] !== null && option !== currentQuestions[currentQuestionIndex].answer && userAnswers[currentQuestionIndex] === option
                            }" class="p-0 mb-2 transition-all duration-300 cursor-pointer question-option shadow-lg"
                                @click="selectOption(option)">
                                <label class="flex items-center py-2">
                                    <input type="radio" :name="'question' + currentQuestionIndex" :value="option"
                                        v-model="userAnswers[currentQuestionIndex]" class="hidden" />
                                    {{ option }}
                                </label>
                            </UCard>
                        </div>
                    </div>

                    <div v-else-if="selectedQuizType === 'image'" class="grid grid-cols-2 gap-4">
                        <div v-for="(option, index) in currentQuestions[currentQuestionIndex].options" :key="option"
                            class="mb-1">
                            <UCard :class="{
                                'bg-quiz': userAnswers[currentQuestionIndex] !== option,
                                'bg-emerald-600 text-white': feedback[currentQuestionIndex] !== null && option === currentQuestions[currentQuestionIndex].answer,
                                'bg-rose-600 text-white': feedback[currentQuestionIndex] !== null && option !== currentQuestions[currentQuestionIndex].answer && userAnswers[currentQuestionIndex] === option
                            }" class="p-0 mb-2 transition-all duration-300 cursor-pointer question-option"
                                @click="selectOption(option)">
                                <label class="flex items-center justify-center">
                                    <NuxtImg :src="option" alt="Option Image" class="w-full h-36 object-contain" />
                                </label>
                            </UCard>
                        </div>
                    </div>



                    <div class="flex text-center my-4">
                        <UButton v-if="currentQuestionIndex < currentQuestions.length - 1" @click="nextQuestion"
                            size="xl" :disabled="!isAnswered" color="black" :class="{ 'hidden': !isAnswered }"
                            class="text-center w-full sm:w-1/2 mx-auto rounded-3xl">
                            Suivant
                            <UIcon name="i-heroicons-forward" class="text-white" />
                        </UButton>
                        <UButton v-else @click="finishQuiz" class="text-center w-full sm:w-1/2 mx-auto"
                            :class="{ 'hidden': !isAnswered }" color="black" :ui="{ rounded: 'rounded-full' }"
                            icon="i-heroicons-star">
                            Terminer et afficher les résultats
                        </UButton>
                    </div>

                    <div v-if="feedback[currentQuestionIndex] !== null" class="text-sm text-center text-gray-500 my-2"
                        :class="{ '': feedback[currentQuestionIndex], '': !feedback[currentQuestionIndex] }">
                        <div v-if="feedback[currentQuestionIndex] === true" v-motion>
                            <p class="text-emerald-600">
                                <UIcon name="i-heroicons-check-circle" size="md" />
                                Bonne réponse
                            </p>
                            <p> {{ currentQuestions[currentQuestionIndex].explanation }}</p>
                        </div>
                        <div v-else v-motion>
                            <p class="text-rose-600">
                                <UIcon name="i-heroicons-x-circle" size="md" />
                                Mauvaise réponse
                            </p>
                            <p>{{ currentQuestions[currentQuestionIndex].explanation }}</p>
                        </div>
                    </div>

                </UCard>
            </div>

            <div v-else>
                <UCard class="p-4 shadow-lg text-center">
                    <h2 class="text-xl font-semibold mb-4">Résultat</h2>
                    <p class="mb-6">
                        Vous avez obtenu {{ correctAnswersCount }} bonnes réponses sur {{ currentQuestions.length }}
                        questions.
                    </p>
                    <div class="mx-auto text-center">

                        <CustomCircleProgressBar
                            :progress="Math.round((correctAnswersCount / currentQuestions.length) * 100)" />

                    </div>
                    <UButton @click="restartQuiz" class="mt-4 w-40" color="black" icon="i-heroicons-arrow-path"
                        size="xl">
                        Rejouer
                    </UButton>
                    <div class="hidden">
                        <p>
                            Voici vos réponses
                        </p>
                        <div v-for="(question, index) in currentQuestions" :key="index" v-motion class="mb-6 hidden">
                            <p class="text-lg mb-2">{{ index + 1 }}. {{ question.question }}</p>
                            <p
                                :class="{ 'text-green-600': isAnswerCorrect(index), 'text-red-600': !isAnswerCorrect(index) }">
                                Votre réponse : {{ userAnswers[index] }} (Correct : {{ question.answer }})
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>
        </div>

        <div v-else>
            <p class="text-center">Chargement des questions...</p>
        </div>

    </div>
</template>

<style>
.bg-quiz {
    background-color: #f5f5f76e;
}

.custom-shadow {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.transition-all {
    transition: all 0.3s ease-in-out;
}

input[type="radio"] {
    display: none;
}

.question-option {
    border-radius: 0px;
}

button {
    border-radius: 1.5rem;
}

.card-question div {
    padding-top: 0;
    padding-bottom: 0;
}
</style>
