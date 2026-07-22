// Memory interface
export interface Memory {
  id: string;
  poiId: string;
  poiName: string;
  type: "photo" | "video" | "audio" | "text";
  content: string;
  caption?: string;
  date: string;
  timestamp: number;
}

// POI interface
export interface POI {
  id: string;
  name: string;
  category: "Monument" | "Museum" | "Parks & Nature" | "Historic Site";
  distance: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  location: string;
  rating: number;
  views: number;
  details: {
    built?: string;
    height?: string;
    access?: string;
    open?: string;
    entry?: string;
    features?: string[];
  };
}

// POI data
export const POIS: POI[] = [
  {
    id: "bahrain-fort",
    name: "Bahrain Fort",
    category: "Historic Site",
    distance: "0.5 km",
    rating: 4.8,
    views: 3241,
    description: "UNESCO World Heritage archaeological site",
    fullDescription:
      "A UNESCO World Heritage Site dating back over 4,000 years, Bahrain Fort (Qal'at al-Bahrain) is one of the most significant archaeological sites in the Gulf region. The fort overlooks the sea and contains layers of civilisation from the Dilmun era through Portuguese occupation, offering families a rich journey through ancient history.",
    imageUrl:
      "https://images.unsplash.com/photo-1716740975436-e973756e526c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1080",
    location: "Seef, Northern Governorate, Bahrain",
    details: {
      built: "2300 BC",
      open: "8am-8pm",
      entry: "Free",
      features: ["Museum", "Sea views", "Archaeological site", "Accessible"],
    },
  },
  {
    id: "al-fatih-mosque",
    name: "Al-Fatih Grand Mosque",
    category: "Monument",
    distance: "1.2 km",
    rating: 4.9,
    views: 4102,
    description: "One of the largest mosques in the world",
    fullDescription:
      "The Al-Fatih Grand Mosque is one of the largest mosques in the world, capable of accommodating over 7,000 worshippers. Built in 1988, it features stunning architecture including a massive fibreglass dome and Italian marble throughout. Non-Muslim visitors are welcome on guided tours, making it a memorable cultural experience for families.",
    imageUrl:
      "https://tourismbh.com/uploads/history-and-culture/Al_Fateh_Banner_2.webp?q=80&w=1080",
    location: "Al Fatih Highway, Manama, Bahrain",
    details: {
      built: "1988",
      open: "9am-4pm",
      entry: "Free",
      features: ["Guided tours", "Gift shop", "Accessible", "Visitor centre"],
    },
  },
  {
    id: "bahrain-national-museum",
    name: "Bahrain National Museum",
    category: "Museum",
    distance: "0.8 km",
    rating: 4.7,
    views: 2876,
    description: "The oldest and largest museum in Bahrain",
    fullDescription:
      "The Bahrain National Museum is the oldest and largest museum in the country, opened in 1988. It houses extensive collections covering Bahrain's history from the Dilmun civilisation to the present day, including burial mounds, ancient artefacts, and traditional crafts. An excellent family destination with interactive exhibits suitable for children of all ages.",
    imageUrl:
      "https://images.unsplash.com/photo-1609097071292-130c2c9c196c?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1080",
    location: "Al Fatih Highway, Manama, Bahrain",
    details: {
      open: "8am-8pm",
      entry: "Free",
      features: ["Cafe", "Gift shop", "Interactive exhibits", "Accessible"],
    },
  },
  {
    id: "bab-al-bahrain",
    name: "Bab Al Bahrain",
    category: "Historic Site",
    distance: "0.3 km",
    rating: 4.5,
    views: 1943,
    description: "Historic gateway to the old souq of Manama",
    fullDescription:
      "Bab Al Bahrain, meaning Gate of Bahrain, is a historic archway built in 1945 that serves as the iconic entrance to the old souq of Manama. The surrounding souq is a vibrant traditional market where families can explore gold, spices, textiles, and traditional Bahraini crafts, providing a genuine immersion in local culture.",
    imageUrl:
      "https://audiala.com/assets/images_cc/Q2877666/0_bab_al_bahrain_manama_bahrain_2024.jpg?q=80&w=1080",
    location: "Government Road, Manama, Bahrain",
    details: {
      built: "1945",
      access: "24/7",
      entry: "Free",
      features: ["Souq", "Shopping", "Restaurants", "Cultural experience"],
    },
  },
  {
    id: "tree-of-life",
    name: "Tree of Life",
    category: "Monument",
    distance: "40 km",
    rating: 4.3,
    views: 5621,
    description: "Mysterious 400-year-old tree in the desert",
    fullDescription:
      "The Tree of Life is a 400-year-old mesquite tree standing alone in the middle of the Bahraini desert, with no obvious water source nearby. Standing approximately 9.75 metres tall and spreading 30 metres wide, it is one of Bahrain's most visited natural landmarks and a source of wonder for both adults and children who marvel at its survival in such an arid landscape.",
    imageUrl:
      "https://images.unsplash.com/photo-1664988833882-640072d4bc81?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1080",
    location: "Southern Governorate, Bahrain",
    details: {
      access: "24/7",
      entry: "Free",
      height: "9.75m",
      features: ["Natural landmark", "Desert scenery", "Photography"],
    },
  },
  {
    id: "al-areen-wildlife-park",
    name: "Al Areen Wildlife Park",
    category: "Parks & Nature",
    distance: "35 km",
    rating: 4.6,
    views: 1432,
    description: "Bahrain's only wildlife sanctuary",
    fullDescription:
      "Al Areen Wildlife Park is Bahrain's only wildlife sanctuary, home to over 45 species of animals and 80 species of birds. Established in 1976, the park features Arabian oryx, gazelles, ostriches, and numerous exotic species in natural habitats. An outstanding family destination offering safari-style exploration and educational experiences for children.",
    imageUrl:
      "https://images.unsplash.com/photo-1648246871164-49013500b26d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1080",
    location: "Southern Governorate, Bahrain",
    details: {
      open: "9am-5pm",
      entry: "BD 2 adults",
      features: ["Safari tour", "Picnic areas", "Educational centre", "Cafe"],
    },
  },
  {
    id: "qal-at-arad",
    name: "Arad Fort",
    category: "Historic Site",
    distance: "8 km",
    rating: 4.4,
    views: 1876,
    description: "15th century Portuguese fort in Muharraq",
    fullDescription:
      "Arad Fort is a beautifully restored 15th century fort located in the Muharraq governorate of Bahrain. Originally built by the Omani Arabs and later used by the Portuguese, the fort features distinctive circular towers and a surrounding moat. The fort hosts regular cultural events and light shows, making it a particularly engaging destination for families visiting in the evening.",
    imageUrl:
      "https://images.unsplash.com/photo-1674251454089-9c95931dd8a6?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1080",
    location: "Arad, Muharraq, Bahrain",
    details: {
      built: "15th century",
      open: "8am-8pm",
      entry: "Free",
      features: ["Light shows", "Cultural events", "Photography", "Accessible"],
    },
  },
];
