/**
 * FAQ festival — alignée sur backend load_faq_data.py (FR / EN / ES).
 */

export type FaqLocale = 'en' | 'fr' | 'es';

export type FaqEntry = {
  id: string;
  order: number;
  question: Record<FaqLocale, string>;
  answer: Record<FaqLocale, string>;
};

export const FAQ_ITEMS: FaqEntry[] = [
  {
    id: '1',
    order: 1,
    question: {
      fr: "L'hôtel est-il situé près du lieu de l'événement ?",
      en: 'Is the hotel located near the venue?',
      es: '¿Está el hotel cerca del lugar del evento?',
    },
    answer: {
      fr: "L'hôtel est à 15 minutes en voiture du lieu de l'événement. Un service de navette sera proposé (2 euros) pendant toute la durée du séjour.\n\n40 Av. du Maréchal de Lattre de Tassigny, 92360 Meudon",
      en: 'The hotel is a 15-minute drive from the venue. A shuttle bus service will be provided (2 euros) throughout the entire stay.\n\n40 Av. du Maréchal de Lattre de Tassigny, 92360 Meudon',
      es: 'El hotel está a 15 minutos en coche del lugar del evento. Se proporcionará un servicio de autobús lanzadera (2 euros) durante toda la estancia.\n\n40 Av. du Maréchal de Lattre de Tassigny, 92360 Meudon',
    },
  },
  {
    id: '2',
    order: 2,
    question: {
      fr: 'Quels types de pass sont disponibles ?',
      en: 'What kind of passes can I find?',
      es: '¿Qué tipos de pases hay disponibles?',
    },
    answer: {
      fr: 'Nous proposons 3 catégories :\n• Tout inclus (hôtel + full pass)\n• Full pass\n• Party pass\n\nTous les pass donnent accès à 4 jours et 4 nuits de festival. Vous pouvez retrouver tous les détails et ce que chaque pass inclut directement sur notre site.',
      en: 'We offer 3 categories:\n• All-inclusive (hotel + full pass)\n• Full pass\n• Party pass\n\nAll passes give you access to 4 days and 4 nights of the festival. You can find all the details and what each pass includes directly on our website.',
      es: 'Ofrecemos 3 categorías:\n• Todo incluido (hotel + full pass)\n• Full pass\n• Party pass\n\nTodos los pases dan acceso a 4 días y 4 noches del festival. Puedes encontrar todos los detalles y lo que incluye cada pase directamente en nuestro sitio web.',
    },
  },
  {
    id: '3',
    order: 3,
    question: {
      fr: 'Le festival offre-t-il des qualifications directes pour la Social World Cup ?',
      en: 'Does the festival offer direct qualifications for the Social World Cup?',
      es: '¿El festival ofrece clasificaciones directas para la Social World Cup?',
    },
    answer: {
      fr: "Oui, nous organisons une compétition Jack & Jill avec des places de qualification directe. Elle offre 3 places pour les leaders et 3 pour les followers.\n\nCependant, elle n'est accessible que par des présélections organisées dans toute la France, ainsi que lors des présélections du festival organisées le vendredi.",
      en: 'Yes, we host a Jack & Jill competition with direct qualification spots. It offers 3 spots for leaders and 3 for followers.\n\nHowever, it is only accessible through pre-selections held across France, as well as during the festival pre-selections organized on Friday.',
      es: 'Sí, organizamos una competición Jack & Jill con plazas de clasificación directa. Ofrece 3 plazas para leaders y 3 para followers.\n\nSin embargo, solo es accesible a través de preselecciones realizadas en toda Francia, así como durante las preselecciones del festival organizadas el viernes.',
    },
  },
  {
    id: '4',
    order: 4,
    question: {
      fr: "Est-il possible d'obtenir un pass journalier ou un pass pour une seule soirée ?",
      en: 'Is it possible to get a day pass or a single-night pass?',
      es: '¿Es posible obtener un pase de un día o un pase para una sola noche?',
    },
    answer: {
      fr: "Non, notre festival est conçu comme une expérience complète de 4 jours. Comme il affiche complet chaque année, nous ne sommes pas en mesure de proposer des pass journaliers.\n\nCependant, un nombre limité de party pass peut être disponible pour les soirées du jeudi et du dimanche.",
      en: 'No, our festival is designed as a full 4-day experience. As it sells out every year, we are not able to offer day passes.\n\nHowever, a limited number of party passes may be available for Thursday and Sunday nights.',
      es: 'No, nuestro festival está diseñado como una experiencia completa de 4 días. Como se agota cada año, no podemos ofrecer pases de un día.\n\nSin embargo, un número limitado de party passes puede estar disponible para las noches del jueves y del domingo.',
    },
  },
  {
    id: '5',
    order: 5,
    question: {
      fr: 'Quelle est votre politique concernant le vestiaire, les bouteilles et la nourriture ?',
      en: 'What is your cloakroom, bottle and food policy?',
      es: '¿Cuál es su política de guardarropa, botellas y comida?',
    },
    answer: {
      fr: "Notre vestiaire est inclus dans tous les pass, mais il est obligatoire.\n\nLes bouteilles d'eau réutilisables sont autorisées pendant les ateliers, mais pas pendant les soirées.\n\nPour des raisons de sécurité, les bouteilles externes, les gourdes et la nourriture extérieure ne sont pas autorisées à l'intérieur de l'événement.\n\nDes points d'eau seront disponibles sur place, et de l'eau en bouteille sera également disponible à l'achat.",
      en: 'Our cloakroom is included in all passes, but it is mandatory.\n\nReusable water bottles are allowed during workshops, but not during parties.\n\nFor security reasons, external bottles, flasks, and outside food are not permitted inside the event.\n\nWater points will be available on site, and bottled water will also be available for purchase.',
      es: 'Nuestro guardarropa está incluido en todos los pases, pero es obligatorio.\n\nLas botellas de agua reutilizables están permitidas durante los talleres, pero no durante las fiestas.\n\nPor razones de seguridad, las botellas externas, cantimploras y comida externa no están permitidas dentro del evento.\n\nHabrá puntos de agua disponibles en el lugar, y también habrá agua embotellada disponible para comprar.',
    },
  },
  {
    id: '6',
    order: 6,
    question: {
      fr: 'Y a-t-il de la nourriture et des boissons disponibles sur place ?',
      en: 'Is there food and drinks available on site?',
      es: '¿Hay comida y bebidas disponibles en el lugar?',
    },
    answer: {
      fr: 'Oui, il y a un bar et un service de restauration disponibles pendant tout le festival.',
      en: 'Yes, there is a bar and food service available throughout the entire festival.',
      es: 'Sí, hay un bar y servicio de comida disponibles durante todo el festival.',
    },
  },
  {
    id: '7',
    order: 7,
    question: {
      fr: "Le prix tout inclus hôtel + festival est-il par chambre ou par personne ?",
      en: 'Does the all-inclusive hotel + festival price apply per room or per person?',
      es: '¿El precio todo incluido hotel + festival es por habitación o por persona?',
    },
    answer: {
      fr: "Le prix est pour la chambre complète.\n\nChambre Premium ➡️ 3 personnes, 4 nuits, 3 full pass\nChambre Standard ➡️ 2 personnes, 4 nuits, 2 full pass\n\nAprès l'inscription, vous recevrez un nouvel email quelques jours plus tard pour compléter les détails de la chambre et de votre full pass.",
      en: 'The price is for the full room.\n\nPremium room ➡️ 3 people, 4 nights, 3 full passes\nStandard room ➡️ 2 people, 4 nights, 2 full passes\n\nAfter registration, you will receive a new email a few days later to complete the room details and your full pass.',
      es: 'El precio es por la habitación completa.\n\nHabitación Premium ➡️ 3 personas, 4 noches, 3 full passes\nHabitación Estándar ➡️ 2 personas, 4 noches, 2 full passes\n\nDespués del registro, recibirás un nuevo correo electrónico unos días después para completar los detalles de la habitación y tu full pass.',
    },
  },
  {
    id: '8',
    order: 8,
    question: {
      fr: 'Comment ça marche si je veux participer au battle ou au Jack & Jill ?',
      en: 'How does it work if I want to participate in the battle or Jack & Jill?',
      es: '¿Cómo funciona si quiero participar en el battle o en el Jack & Jill?',
    },
    answer: {
      fr: "Il y a une section dédiée pour chaque concept où vous pouvez vous inscrire. L'inscription est obligatoire avant le festival.\n\nPour participer, un minimum de party pass est requis.",
      en: 'There is a dedicated section for each concept where you can register. Registration is mandatory before the festival.\n\nTo participate, a minimum of a party pass is required.',
      es: 'Hay una sección dedicada para cada concepto donde puedes registrarte. El registro es obligatorio antes del festival.\n\nPara participar, se requiere un mínimo de party pass.',
    },
  },
];

/**
 * FAQ localisée pour la locale courante (fallback EN).
 */
export function faqForLocale(locale: FaqLocale): { id: string; question: string; answer: string }[] {
  return [...FAQ_ITEMS]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      id: item.id,
      question: item.question[locale] || item.question.en,
      answer: item.answer[locale] || item.answer.en,
    }));
}
