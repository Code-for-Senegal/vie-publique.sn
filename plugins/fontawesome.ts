// plugins/fontawesome.ts
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { Plugin } from 'nuxt/app';
import {
  faLocationDot,
  faCakeCandles,
  faBriefcase,
  faEnvelope,
  faPhone
} from '@fortawesome/free-solid-svg-icons';

// Ajouter les icônes à la bibliothèque
library.add(
  faLocationDot,
  faCakeCandles,
  faBriefcase,
  faEnvelope,
  faPhone
);

const fontawesomePlugin: Plugin = (nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon);
};

export default fontawesomePlugin;