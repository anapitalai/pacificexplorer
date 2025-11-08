export interface Destination {
  id: number;
  name: string;
  province: string;
  category: "Coastal" | "Inland" | "Geothermal" | "Cultural";
  description: string;
  longDescription: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  image: string;
  featured: boolean;
  satelliteImageUrl?: string;
  activities: string[];
  bestTimeToVisit: string;
  accessibility: "Easy" | "Moderate" | "Difficult";
  highlights: string[];
}

export const destinations: Destination[] = [
  {
    id: 1,
    name: "Tufi Resort",
    province: "Oro Province",
    category: "Coastal",
    description: "World-class diving among pristine fjords and coral reefs",
    longDescription: "Tufi is renowned for its dramatic fjords carved by ancient volcanic activity, creating a unique landscape where lush rainforest meets crystal-clear waters. The area offers some of the world's best diving experiences with pristine coral reefs, diverse marine life, and excellent visibility. The resort provides access to both soft and hard coral dive sites, wall diving, and WWII wreck diving.",
    coordinates: { lat: -9.0755, lng: 149.3199 },
    image: "from-ocean-400 to-ocean-600",
    featured: true,
    activities: ["Scuba Diving", "Snorkeling", "Kayaking", "Cultural Tours", "Fishing"],
    bestTimeToVisit: "May to November (dry season)",
    accessibility: "Moderate",
    highlights: [
      "Pristine fjords and coral reefs",
      "WWII wreck diving sites",
      "Traditional villages and cultural experiences",
      "Excellent diving visibility (20-40m)",
    ],
  },
  {
    id: 2,
    name: "Kokoda Track",
    province: "Central Province",
    category: "Inland",
    description: "Historic hiking trail through rugged mountain terrain",
    longDescription: "The Kokoda Track is a 96-kilometer hiking trail spanning the Owen Stanley Range. This historic path was the site of significant WWII battles between Australian and Japanese forces. Today, it offers trekkers a challenging adventure through dense jungle, steep mountain passes, and remote villages. The trail provides a profound connection to history while experiencing PNG's incredible biodiversity and meeting local communities.",
    coordinates: { lat: -9.1333, lng: 147.7333 },
    image: "from-paradise-green to-paradise-green/70",
    featured: true,
    activities: ["Trekking", "Historical Tours", "Village Visits", "Bird Watching", "Photography"],
    bestTimeToVisit: "April to September",
    accessibility: "Difficult",
    highlights: [
      "Historic WWII battlefields and memorials",
      "Challenging mountain terrain (max elevation 2,190m)",
      "Remote village cultural experiences",
      "Incredible biodiversity and bird watching",
    ],
  },
  {
    id: 3,
    name: "Tavurvur Volcano",
    province: "East New Britain",
    category: "Geothermal",
    description: "Active volcano with stunning views of Rabaul Harbor",
    longDescription: "Tavurvur is an active stratovolcano that last erupted in 2014. Located on the eastern rim of Rabaul's caldera, it offers visitors a rare opportunity to safely witness an active volcano. The area around Rabaul combines volcanic landscapes with WWII history, as the harbor was a major Japanese base. Visitors can explore underground tunnel networks, visit hot springs, and witness the dramatic volcanic landscape.",
    coordinates: { lat: -4.2708, lng: 152.2036 },
    image: "from-png-red to-paradise-coral",
    featured: true,
    activities: ["Volcano Tours", "Historical Sites", "Hot Springs", "Photography", "Cultural Tours"],
    bestTimeToVisit: "Year-round (monitor volcanic activity)",
    accessibility: "Moderate",
    highlights: [
      "Active volcanic activity viewing",
      "WWII Japanese tunnels and bunkers",
      "Natural hot springs",
      "Dramatic caldera views",
    ],
  },
  {
    id: 4,
    name: "Varirata National Park",
    province: "Central Province",
    category: "Inland",
    description: "Bird watching paradise with diverse wildlife",
    longDescription: "Just 42km from Port Moresby, Varirata National Park is PNG's most accessible protected area. The park protects montane rainforest at 800m elevation, offering cooler temperatures and incredible biodiversity. It's renowned for bird watching, with over 70 species including birds of paradise, bowerbirds, and hornbills. The park features well-maintained walking trails, lookout points with views to Port Moresby, and opportunities to see tree kangaroos and other wildlife.",
    coordinates: { lat: -9.4396, lng: 147.3689 },
    image: "from-paradise-green/80 to-paradise-sky",
    featured: false,
    activities: ["Bird Watching", "Hiking", "Wildlife Spotting", "Photography", "Picnicking"],
    bestTimeToVisit: "May to October",
    accessibility: "Easy",
    highlights: [
      "Over 70 bird species including birds of paradise",
      "Tree kangaroos and other endemic wildlife",
      "Scenic lookout points",
      "Easy access from Port Moresby",
    ],
  },
  {
    id: 5,
    name: "Loloata Island Resort",
    province: "Central Province",
    category: "Coastal",
    description: "Secluded island paradise perfect for diving and relaxation",
    longDescription: "Loloata Island is a small coral atoll located 20 minutes by boat from Port Moresby. Despite its proximity to the capital, the island offers pristine waters, excellent diving, and a peaceful retreat. The resort is built over the water on stilts, providing direct access to the ocean. The surrounding reefs host diverse marine life including reef sharks, rays, turtles, and countless tropical fish species.",
    coordinates: { lat: -9.5833, lng: 147.2833 },
    image: "from-ocean-500 to-paradise-sky",
    featured: false,
    activities: ["Diving", "Snorkeling", "Kayaking", "Fishing", "Relaxation"],
    bestTimeToVisit: "Year-round",
    accessibility: "Easy",
    highlights: [
      "Over-water bungalows",
      "Easy access from Port Moresby",
      "Excellent diving and snorkeling",
      "Reef sharks and sea turtles",
    ],
  },
  {
    id: 6,
    name: "Mount Wilhelm",
    province: "Simbu Province",
    category: "Inland",
    description: "PNG's highest peak at 4,509m with spectacular views",
    longDescription: "Mount Wilhelm is the highest mountain in Papua New Guinea and the entire Australian continent's island arc. The climb takes trekkers through multiple ecological zones, from tropical rainforest through moss forest to alpine grassland above the treeline. On clear mornings, both the north and south coasts of PNG are visible from the summit. The trek typically takes 3-4 days and offers a unique high-altitude experience in the tropics.",
    coordinates: { lat: -5.7833, lng: 145.0333 },
    image: "from-gray-600 to-gray-400",
    featured: false,
    activities: ["Mountain Climbing", "Trekking", "Photography", "Bird Watching", "Camping"],
    bestTimeToVisit: "June to September",
    accessibility: "Difficult",
    highlights: [
      "Highest peak in PNG (4,509m)",
      "Multiple ecological zones",
      "360-degree summit views",
      "Unique alpine flora and fauna",
    ],
  },
  {
    id: 7,
    name: "Sepik River",
    province: "East Sepik",
    category: "Cultural",
    description: "Experience traditional villages and rich cultural heritage",
    longDescription: "The Sepik River is one of the world's greatest river systems and PNG's cultural heartland. The river and its tributaries are lined with traditional villages where ancient customs and art forms continue to thrive. Visitors travel by boat to visit spirit houses (Haus Tambaran), witness traditional ceremonies, and meet master carvers. The Sepik is renowned for its artistic traditions, producing intricate wood carvings, pottery, and ceremonial masks.",
    coordinates: { lat: -4.2167, lng: 143.6333 },
    image: "from-png-yellow to-paradise-sand",
    featured: false,
    activities: ["River Cruises", "Cultural Tours", "Village Visits", "Art & Crafts", "Photography"],
    bestTimeToVisit: "May to November",
    accessibility: "Moderate",
    highlights: [
      "Traditional spirit houses (Haus Tambaran)",
      "World-renowned wood carvings and art",
      "Ceremonial performances",
      "River wildlife including crocodiles and birds",
    ],
  },
  {
    id: 8,
    name: "Kimbe Bay",
    province: "West New Britain",
    category: "Coastal",
    description: "One of the world's most biodiverse coral reef ecosystems",
    longDescription: "Kimbe Bay is recognized as one of the world's top diving destinations and a global center of coral biodiversity. The bay contains over 900 species of reef fish and 400 species of coral - representing 60% of all Indo-Pacific coral species. The area includes seamounts, coral walls, WWII wrecks, and volcanic hot springs underwater. Conservation efforts have helped maintain this pristine marine environment.",
    coordinates: { lat: -5.5500, lng: 150.1500 },
    image: "from-ocean-600 to-ocean-400",
    featured: false,
    activities: ["Diving", "Snorkeling", "Marine Conservation", "Photography", "Research"],
    bestTimeToVisit: "Year-round (best visibility May-November)",
    accessibility: "Moderate",
    highlights: [
      "900+ species of reef fish",
      "60% of Indo-Pacific coral species",
      "Underwater volcanic vents",
      "WWII wreck diving",
    ],
  },
];

export function getDestinationById(id: number): Destination | undefined {
  return destinations.find((dest) => dest.id === id);
}

export function getDestinationsByCategory(category: string): Destination[] {
  if (category === "All") return destinations;
  return destinations.filter((dest) => dest.category === category);
}

export function getFeaturedDestinations(): Destination[] {
  return destinations.filter((dest) => dest.featured);
}
