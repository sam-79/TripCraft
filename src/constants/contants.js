
// A centralized file for application-wide constants.

// App Title - Used in the header, page titles, etc.
export const APP_TITLE = "TripCraft AI";
export const APP_TITLE_SHORT = "AI";

// Logo URL - Can be a path to a local asset or a URL.
// Using an inline SVG for a clean, scalable logo that doesn't require extra file loading.
export const APP_LOGO_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%237B66FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-compass"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`;



export const all_enums = {
  native_languages: [
    "English",
    "Hindi",
    "Tamil",
    "Telugu",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Malayalam",
    "Kannada",
    "Punjabi",
    "Other"
  ],
  activities: [
    "Adventure",
    "Heritage",
    "Nightlife",
    "Relaxation",
    "Nature",
    "Culture"
  ],
  travelling_with: [
    "Solo",
    "Partner",
    "Friends",
    "Family"
  ],
  travel_modes: [
    "Bike",
    "Car",
    "Flight",
    "Train",
    "Train&Road",
    "Flight&Road",
    "Custom"
  ],
  property_types: [
    "Hotel",
    "Homestay",
    "Villa",
    "Cottage",
    "Apartment",
    "Resort",
    "Hostel",
    "Camp",
    "Guest House",
    "Tree House",
    "Palace",
    "Farm House",
    "Airbnb"
  ],
  food_preferences: [
    "Veg",
    "Non-Veg",
    "Vegan",
    "Anything"
  ],
  train_classes: [
    "SL",
    "3A",
    "3E",
    "2A",
    "1A"
  ],
  departure_times: [
    "Morning",
    "Afternoon",
    "Evening",
    "Night"
  ]
};


export const activityOptions = [
  "CULTURE",
  "ADVENTURE",
  "NATURE",
  "HISTORICAL",
  "FOOD",
  "RELAXATION",
];

export const bestTimeOptions = ["Morning", "Afternoon", "Evening", "Night", "All Day"];

export const fallBackData = [
  {
    name: "Rann Utsav",
    city: "Rann of Kutch",
    state: "Gujarat",
    activitytype: "CULTURE",
    Best_time_to_visit: "Evening",
    Image_url: "https://www.rannutsav.com/blog/wp-content/uploads/2024/12/141013682_715635635803639_4674705074199093637_n-1.png",
    description: "Rann Utsav is a well-known Cultural festival located in the Rann of Kutch. Think shimmering white salt desert, folk music, crafts, tent city, and surreal sunsets.",
    ideal_duration_hours: 3.0,
    google_review_rating: 4.9,
    entrance_fee_inr: 7500,
    airport_nearby: "TRUE",
    weekly_off: "None",
    dslr_allowed: "TRUE"
  },
  {
    name: "Golden Temple (Harmandir Sahib)",
    city: "Amritsar",
    state: "Punjab",
    activitytype: "CULTURE",
    Best_time_to_visit: "All",
    Image_url: "https://upload.wikimedia.org/wikipedia/commons/9/94/The_Golden_Temple_of_Amrithsar_7.jpg",
    description: "Golden Temple (Harmandir Sahib) is a well-known Religious Site located in Amritsar. It is of Spiritual significance.",
    ideal_duration_hours: 1.5,
    google_review_rating: 4.9,
    entrance_fee_inr: 0,
    airport_nearby: "TRUE",
    weekly_off: "None",
    dslr_allowed: "TRUE"
  },
  {
    name: "Pangong Tso",
    city: "Leh",
    state: "Ladakh",
    activitytype: "NATURE",
    Best_time_to_visit: "Morning",
    Image_url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/00/2f/67/img-20180620-wa0007-largejpg.jpg?w=900&h=500&s=1",
    description: "Pangong Tso is a well-known Lake located in Leh. It is of Nature significance.",
    ideal_duration_hours: 2.0,
    google_review_rating: 4.9,
    entrance_fee_inr: 20,
    airport_nearby: "TRUE",
    weekly_off: "None",
    dslr_allowed: "TRUE"
  },
  {
    name: "Siddhivinayak Temple",
    city: "Mumbai",
    state: "Maharastra",
    activitytype: "CULTURE",
    Best_time_to_visit: "All",
    Image_url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Shree_Siddhivinayak_Temple_Mumbai.jpg",
    description: "Siddhivinayak Temple is a well-known Temple located in Mumbai. It is of Religious significance.",
    ideal_duration_hours: 2.0,
    google_review_rating: 4.8,
    entrance_fee_inr: 0,
    airport_nearby: "TRUE",
    weekly_off: "None",
    dslr_allowed: "FALSE"
  },
  {
    name: "Mahalakshmi Temple",
    city: "Kolhapur",
    state: "Maharastra",
    activitytype: "CULTURE",
    Best_time_to_visit: "All",
    Image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Mahalaxmi_Temple%2C_Kolhapur.jpg/640px-Mahalaxmi_Temple%2C_Kolhapur.jpg",
    description: "Mahalakshmi Temple is a well-known Temple located in Kolhapur. It is of Religious significance.",
    ideal_duration_hours: 1.0,
    google_review_rating: 4.8,
    entrance_fee_inr: 0,
    airport_nearby: "TRUE",
    weekly_off: "None",
    dslr_allowed: "FALSE"
  },
  {
    name: "Mahakaleshwar Jyotirlinga",
    city: "Ujjain",
    state: "Madhya Pradesh",
    activitytype: "CULTURE",
    Best_time_to_visit: "All",
    Image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Mahakal_Temple_Ujjain.JPG/1200px-Mahakal_Temple_Ujjain.JPG",
    description: "Mahakaleshwar Jyotirlinga is a well-known Temple located in Ujjain. It is of Religious significance.",
    ideal_duration_hours: 1.5,
    google_review_rating: 4.8,
    entrance_fee_inr: 0,
    airport_nearby: "TRUE",
    weekly_off: "None",
    dslr_allowed: "FALSE"
  },
  {
    name: "Orchha Fort",
    city: "Orchha",
    state: "Madhya Pradesh",
    activitytype: "ADVENTURE",
    Best_time_to_visit: "Afternoon",
    Image_url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/1d/24/96/the-marvellous-orchha.jpg?w=900&h=500&s=1",
    description: "Orchha Fort is a well-known Fort located in Orchha. It is of Historical significance.",
    ideal_duration_hours: 1.5,
    google_review_rating: 4.8,
    entrance_fee_inr: 10,
    airport_nearby: "FALSE",
    weekly_off: "None",
    dslr_allowed: "TRUE"
  },
  {
    name: "Key Monastery",
    city: "Spiti Valley",
    state: "Himachal Pradesh",
    activitytype: "CULTURE",
    Best_time_to_visit: "Morning",
    Image_url: "https://upload.wikimedia.org/wikipedia/commons/4/49/1000_Year_loop.jpg",
    description: "Key Monastery is a well-known Monastery located in Spiti Valley. It is of Religious significance.",
    ideal_duration_hours: 1.0,
    google_review_rating: 4.8,
    entrance_fee_inr: 0,
    airport_nearby: "FALSE",
    weekly_off: "None",
    dslr_allowed: "TRUE"
  },
  {
    name: "Paragliding Site",
    city: "Bir Billing",
    state: "Himachal Pradesh",
    activitytype: "ADVENTURE",
    Best_time_to_visit: "All",
    Image_url: "https://www.pandotrip.com/wp-content/uploads/2014/05/Top-10-Paragliding-Sites-Slovenia-Photo-by-Robert-Kovacs.jpg",
    description: "Paragliding Site is a well-known Adventure Sport located in Bir Billing. It is of Adventure significance.",
    ideal_duration_hours: 2.0,
    google_review_rating: 4.8,
    entrance_fee_inr: 2500,
    airport_nearby: "FALSE",
    weekly_off: "None",
    dslr_allowed: "TRUE"
  },
  {
    name: "Triund Trek",
    city: "McLeod Ganj",
    state: "Himachal Pradesh",
    activitytype: "ADVENTURE",
    Best_time_to_visit: "Morning",
    Image_url: "https://ik.imagekit.io/wcarzmwtz/trekyaari-images/Triund_-_Trekyaari_26_-jY9cOl6O.jpeg?tr=w-2048,q-100",
    description: "Triund Trek is a well-known Trekking located in McLeod Ganj. It is of Adventure significance.",
    ideal_duration_hours: 5.0,
    google_review_rating: 4.8,
    entrance_fee_inr: 0,
    airport_nearby: "TRUE",
    weekly_off: "None",
    dslr_allowed: "TRUE"
  },
  {
    name: "Badrinath Temple",
    city: "Badrinath",
    state: "Uttarakhand",
    activitytype: "CULTURE",
    Best_time_to_visit: "All",
    Image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Badrinath_Temple_%2C_Uttarakhand.jpg",
    description: "Badrinath Temple is a well-known Temple located in Badrinath. It is of Religious significance.",
    ideal_duration_hours: 1.0,
    google_review_rating: 4.8,
    entrance_fee_inr: 0,
    airport_nearby: "FALSE",
    weekly_off: "None",
    dslr_allowed: "FALSE"
  },
  {
    name: "Gangotri Temple",
    city: "Uttarkashi",
    state: "Uttarakhand",
    activitytype: "CULTURE",
    Best_time_to_visit: "All",
    Image_url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/45/3b/da/the-main-temple.jpg?w=1200&h=-1&s=1",
    description: "Gangotri Temple is a well-known Temple located in Uttarkashi. It is of Religious significance.",
    ideal_duration_hours: 1.0,
    google_review_rating: 4.8,
    entrance_fee_inr: 0,
    airport_nearby: "FALSE",
    weekly_off: "None",
    dslr_allowed: "FALSE"
  },
  {
    name: "Tungnath Temple",
    city: "Chopta",
    state: "Uttarakhand",
    activitytype: "CULTURE",
    Best_time_to_visit: "All",
    Image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Tungnath_temple.jpg/640px-Tungnath_temple.jpg",
    description: "Tungnath Temple is a well-known Temple located in Chopta. It is of Religious significance.",
    ideal_duration_hours: 2.0,
    google_review_rating: 4.8,
    entrance_fee_inr: 0,
    airport_nearby: "FALSE",
    weekly_off: "None",
    dslr_allowed: "FALSE"
  },
]



