import { PrismaClient, Category, Accessibility, Role, PriceRange } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log('🌴 Starting database seed...');

  // Create sample users with different roles
  const sampleUsers = [
    {
      username: 'hotelowner1',
      email: 'hotel@owner.com',
      password: 'hotelowner1',
      name: 'John Hotel Owner',
      role: 'HOTEL_OWNER',
    },
    {
      username: 'hirecarowner1',
      email: 'albert.mong2011@gmail.com',
      password: 'hirecarowner1',
      name: 'Jane Car Rental',
      role: 'HIRE_CAR_OWNER',
    },
    {
      username: 'destinationowner1',
      email: 'destination@owner.com',
      password: 'destinationowner1',
      name: 'Bob Destination Guide',
      role: 'DESTINATION_OWNER',
    },
    {
      username: 'tourist1',
      email: 'tourist@example.com',
      password: 'tourist1',
      name: 'Alice Tourist',
      role: 'TOURIST',
    },
    {
      username: 'anapitalai',
      email: 'anapitalai@gmail.com',
      password: 'admin123',
      name: 'Alois Napitalai ',
      role: 'ADMIN',
    },
    {
      username: 'admin',
      email: 'admin@pacificexplorer.com',
      password: 'admin',
      name: 'Default Admin',
      role: 'ADMIN',
    },
  ];

  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role: userData.role as Role,
          isActive: true,
          emailVerified: new Date(),
        }
      });
      console.log(`✅ Created ${userData.role} user: ${userData.username}`);
    }
  }

  // Clear existing data in correct order (respecting foreign keys)
  try {
    await prisma.booking.deleteMany();
    await prisma.destination.deleteMany();
    console.log('Cleared existing bookings and destinations');
  } catch (error) {
    console.warn('⚠️ Could not clear existing data (may have dependencies):', error);
  }

  const destinations = [
    {
      name: "Tufi Resort",
      province: "Oro Province",
      category: Category.Coastal,
      description: "World-class diving among pristine fjords and coral reefs",
      longDescription: "Tufi is renowned for its dramatic fjords carved by ancient volcanic activity, creating a unique landscape where lush rainforest meets crystal-clear waters. The area offers some of the world's best diving experiences with pristine coral reefs, diverse marine life, and excellent visibility. The resort provides access to both soft and hard coral dive sites, wall diving, and WWII wreck diving.",
      latitude: -9.0755,
      longitude: 149.3199,
      image: "from-ocean-400 to-ocean-600",
      featured: true,
      activities: ["Scuba Diving", "Snorkeling", "Kayaking", "Cultural Tours", "Fishing"],
      bestTimeToVisit: "May to November (dry season)",
      accessibility: Accessibility.Moderate,
      highlights: [
        "Pristine fjords and coral reefs",
        "WWII wreck diving sites",
        "Traditional villages and cultural experiences",
        "Excellent diving visibility (20-40m)",
      ],
    },
    {
      name: "Kokoda Track",
      province: "Central Province",
      category: Category.Inland,
      description: "Historic hiking trail through rugged mountain terrain",
      longDescription: "The Kokoda Track is a 96-kilometer hiking trail spanning the Owen Stanley Range. This historic path was the site of significant WWII battles between Australian and Japanese forces. Today, it offers trekkers a challenging adventure through dense jungle, steep mountain passes, and remote villages. The trail provides a profound connection to history while experiencing PNG's incredible biodiversity and meeting local communities.",
      latitude: -9.1333,
      longitude: 147.7333,
      image: "from-paradise-green to-paradise-green/70",
      featured: true,
      activities: ["Trekking", "Historical Tours", "Village Visits", "Bird Watching", "Photography"],
      bestTimeToVisit: "April to September",
      accessibility: Accessibility.Difficult,
      highlights: [
        "Historic WWII battlefields and memorials",
        "Challenging mountain terrain (max elevation 2,190m)",
        "Remote village cultural experiences",
        "Incredible biodiversity and bird watching",
      ],
    },
    {
      name: "Tavurvur Volcano",
      province: "East New Britain",
      category: Category.Geothermal,
      description: "Active volcano with stunning views of Rabaul Harbor",
      longDescription: "Tavurvur is an active stratovolcano that last erupted in 2014. Located on the eastern rim of Rabaul's caldera, it offers visitors a rare opportunity to safely witness an active volcano. The area around Rabaul combines volcanic landscapes with WWII history, as the harbor was a major Japanese base. Visitors can explore underground tunnel networks, visit hot springs, and witness the dramatic volcanic landscape.",
      latitude: -4.2708,
      longitude: 152.2036,
      image: "from-png-red to-paradise-coral",
      featured: true,
      activities: ["Volcano Tours", "Historical Sites", "Hot Springs", "Photography", "Cultural Tours"],
      bestTimeToVisit: "Year-round (monitor volcanic activity)",
      accessibility: Accessibility.Moderate,
      highlights: [
        "Active volcanic activity viewing",
        "WWII Japanese tunnels and bunkers",
        "Natural hot springs",
        "Dramatic caldera views",
      ],
    },
    {
      name: "Varirata National Park",
      province: "Central Province",
      category: Category.Inland,
      description: "Bird watching paradise with diverse wildlife",
      longDescription: "Just 42km from Port Moresby, Varirata National Park is PNG's most accessible protected area. The park protects montane rainforest at 800m elevation, offering cooler temperatures and incredible biodiversity. It's renowned for bird watching, with over 70 species including birds of paradise, bowerbirds, and hornbills. The park features well-maintained walking trails, lookout points with views to Port Moresby, and opportunities to see tree kangaroos and other wildlife.",
      latitude: -9.4396,
      longitude: 147.3689,
      image: "from-paradise-green/80 to-paradise-sky",
      featured: false,
      activities: ["Bird Watching", "Hiking", "Wildlife Spotting", "Photography", "Picnicking"],
      bestTimeToVisit: "May to October",
      accessibility: Accessibility.Easy,
      highlights: [
        "Over 70 bird species including birds of paradise",
        "Tree kangaroos and other endemic wildlife",
        "Scenic lookout points",
        "Easy access from Port Moresby",
      ],
    },
    {
      name: "Loloata Island Resort",
      province: "Central Province",
      category: Category.Coastal,
      description: "Secluded island paradise perfect for diving and relaxation",
      longDescription: "Loloata Island is a small coral atoll located 20 minutes by boat from Port Moresby. Despite its proximity to the capital, the island offers pristine waters, excellent diving, and a peaceful retreat. The resort is built over the water on stilts, providing direct access to the ocean. The surrounding reefs host diverse marine life including reef sharks, rays, turtles, and countless tropical fish species.",
      latitude: -9.5833,
      longitude: 147.2833,
      image: "from-ocean-500 to-paradise-sky",
      featured: false,
      activities: ["Diving", "Snorkeling", "Kayaking", "Fishing", "Relaxation"],
      bestTimeToVisit: "Year-round",
      accessibility: Accessibility.Easy,
      highlights: [
        "Over-water bungalows",
        "Easy access from Port Moresby",
        "Excellent diving and snorkeling",
        "Reef sharks and sea turtles",
      ],
    },
    {
      name: "Mount Wilhelm",
      province: "Simbu Province",
      category: Category.Inland,
      description: "PNG's highest peak at 4,509m with spectacular views",
      longDescription: "Mount Wilhelm is the highest mountain in Papua New Guinea and the entire Australian continent's island arc. The climb takes trekkers through multiple ecological zones, from tropical rainforest through moss forest to alpine grassland above the treeline. On clear mornings, both the north and south coasts of PNG are visible from the summit. The trek typically takes 3-4 days and offers a unique high-altitude experience in the tropics.",
      latitude: -5.7833,
      longitude: 145.0333,
      image: "from-gray-600 to-gray-400",
      featured: false,
      activities: ["Mountain Climbing", "Trekking", "Photography", "Bird Watching", "Camping"],
      bestTimeToVisit: "June to September",
      accessibility: Accessibility.Difficult,
      highlights: [
        "Highest peak in PNG (4,509m)",
        "Multiple ecological zones",
        "360-degree summit views",
        "Unique alpine flora and fauna",
      ],
    },
    {
      name: "Sepik River",
      province: "East Sepik",
      category: Category.Cultural,
      description: "Experience traditional villages and rich cultural heritage",
      longDescription: "The Sepik River is one of the world's greatest river systems and PNG's cultural heartland. The river and its tributaries are lined with traditional villages where ancient customs and art forms continue to thrive. Visitors travel by boat to visit spirit houses (Haus Tambaran), witness traditional ceremonies, and meet master carvers. The Sepik is renowned for its artistic traditions, producing intricate wood carvings, pottery, and ceremonial masks.",
      latitude: -4.2167,
      longitude: 143.6333,
      image: "from-png-yellow to-paradise-sand",
      featured: false,
      activities: ["River Cruises", "Cultural Tours", "Village Visits", "Art & Crafts", "Photography"],
      bestTimeToVisit: "May to November",
      accessibility: Accessibility.Moderate,
      highlights: [
        "Traditional spirit houses (Haus Tambaran)",
        "World-renowned wood carvings and art",
        "Ceremonial performances",
        "River wildlife including crocodiles and birds",
      ],
    },
    {
      name: "Kimbe Bay",
      province: "West New Britain",
      category: Category.Coastal,
      description: "One of the world's most biodiverse coral reef ecosystems",
      longDescription: "Kimbe Bay is recognized as one of the world's top diving destinations and a global center of coral biodiversity. The bay contains over 900 species of reef fish and 400 species of coral - representing 60% of all Indo-Pacific coral species. The area includes seamounts, coral walls, WWII wrecks, and volcanic hot springs underwater. Conservation efforts have helped maintain this pristine marine environment.",
      latitude: -5.5500,
      longitude: 150.1500,
      image: "from-ocean-600 to-ocean-400",
      featured: false,
      activities: ["Diving", "Snorkeling", "Marine Conservation", "Photography", "Research"],
      bestTimeToVisit: "Year-round (best visibility May-November)",
      accessibility: Accessibility.Moderate,
      highlights: [
        "900+ species of reef fish",
        "60% of Indo-Pacific coral species",
        "Underwater volcanic vents",
        "WWII wreck diving",
      ],
    },
  ];

  // Create destinations
  const createdDestinations = [];
  for (const destination of destinations) {
    const created = await prisma.destination.upsert({
      where: {
        name_province: {
          name: destination.name,
          province: destination.province,
        },
      },
      update: destination,
      create: destination,
    });
    createdDestinations.push(created);
    console.log(`✅ Created/Updated: ${destination.name}`);
  }

  // Assign destinations to owners after creation
  const destinationOwner = await prisma.user.findUnique({
    where: { username: 'destinationowner1' }
  });

  if (destinationOwner) {
    // Update first 3 destinations to assign owner
    for (let i = 0; i < Math.min(3, createdDestinations.length); i++) {
      await prisma.destination.update({
        where: { id: createdDestinations[i].id },
        data: { ownerId: destinationOwner.id }
      });
    }
    console.log(`✅ Assigned destinations to ${destinationOwner.username}`);
  }

  // Create some sample hotels near the sample coordinates used during testing
  try {
    // remove existing hotels (optional) - keep other data intact
    await prisma.hotel.deleteMany();
  } catch {
    // ignore if hotel model not present or other issues
  }

  const sampleHotels = [
    {
      name: 'Seabreeze Lodge',
      province: 'Madang Province',
      city: 'Madang',
      latitude: -6.3135,
      longitude: 143.9890,
      phone: '+675-123-456',
      active: true,
    },
    {
      name: 'Harbour View Hotel',
      province: 'Madang Province',
      city: 'Madang',
      latitude: -6.3170,
      longitude: 143.9905,
      phone: '+675-234-567',
      active: true,
    },
    {
      name: 'Coastal Retreat',
      province: 'Madang Province',
      city: 'Madang',
      latitude: -6.3200,
      longitude: 143.9850,
      phone: '+675-345-678',
      active: true,
    },
  ];

  for (const h of sampleHotels) {
    try {
      await prisma.hotel.create({ data: h });
      console.log(`✅ Seeded hotel: ${h.name}`);
    } catch {
      console.warn('⚠️ Skipped seeding hotel (model missing?):', h.name);
    }
  }

  // Create some sample hire cars (don't delete existing ones)
  const sampleHireCars = [
    {
      name: 'PNG Car Rentals - Port Moresby',
      province: 'National Capital District',
      city: 'Port Moresby',
      latitude: -9.4438,
      longitude: 147.1803,
      address: 'Jackson Airport, Port Moresby, NCD',
      description: 'Reliable car rental service with modern fleet. Perfect for airport transfers and city exploration.',
      phone: '+675-422-1234',
      email: 'bookings@pngcarrentals.com',
      vehicleType: 'SUV',
      passengerCapacity: 5,
      pricePerDay: 85.00,
      priceRange: PriceRange.Moderate,
      features: ['AC', 'GPS', 'Insurance', '24/7 Support', 'Airport Pickup'],
      images: ['/images/hirecar-suv-1.jpg', '/images/hirecar-suv-2.jpg'],
      featuredImage: '/images/hirecar-suv-1.jpg',
      verified: true,
      featured: true,
      active: true,
    },
    {
      name: 'Island Wheels - Madang',
      province: 'Madang Province',
      city: 'Madang',
      latitude: -5.2244,
      longitude: 145.7850,
      address: 'Madang Wharf, Madang Province',
      description: 'Explore Madang and surrounding areas with our well-maintained vehicles. Great for diving trips and coastal adventures.',
      phone: '+675-852-5678',
      email: 'info@islandwheels.com.pg',
      vehicleType: 'Sedan',
      passengerCapacity: 4,
      pricePerDay: 65.00,
      priceRange: PriceRange.Budget,
      features: ['AC', 'GPS', 'Insurance', 'Airport Pickup'],
      images: ['/images/hirecar-sedan-1.jpg', '/images/hirecar-sedan-2.jpg'],
      featuredImage: '/images/hirecar-sedan-1.jpg',
      verified: true,
      featured: false,
      active: true,
    },
    {
      name: 'Highlands Auto Rental',
      province: 'Eastern Highlands Province',
      city: 'Goroka',
      latitude: -6.0833,
      longitude: 145.3833,
      address: 'Goroka Airport, Eastern Highlands Province',
      description: 'Specialized in highland terrain vehicles. Perfect for Kokoda Track access and mountain exploration.',
      phone: '+675-532-9876',
      email: 'rentals@highlandsauto.com.pg',
      vehicleType: '4WD SUV',
      passengerCapacity: 7,
      pricePerDay: 120.00,
      priceRange: PriceRange.Upscale,
      features: ['AC', 'GPS', 'Insurance', '24/7 Support', 'Airport Pickup', '4WD'],
      images: ['/images/hirecar-4wd-1.jpg', '/images/hirecar-4wd-2.jpg'],
      featuredImage: '/images/hirecar-4wd-1.jpg',
      verified: true,
      featured: true,
      active: true,
    },
    {
      name: 'Lae City Motors',
      province: 'Morobe Province',
      city: 'Lae',
      latitude: -6.7333,
      longitude: 147.0000,
      address: 'Lae Nadzab Airport, Morobe Province',
      description: 'Premium vehicle rental in Lae. Business and leisure travel specialists with luxury options.',
      phone: '+675-472-3456',
      email: 'bookings@laemotors.com.pg',
      vehicleType: 'Luxury Sedan',
      passengerCapacity: 4,
      pricePerDay: 150.00,
      priceRange: PriceRange.Luxury,
      features: ['AC', 'GPS', 'Insurance', '24/7 Support', 'Airport Pickup', 'Leather Seats', 'Premium Sound'],
      images: ['/images/hirecar-luxury-1.jpg', '/images/hirecar-luxury-2.jpg'],
      featuredImage: '/images/hirecar-luxury-1.jpg',
      verified: true,
      featured: false,
      active: true,
    },
    {
      name: 'Rabaul Car Hire',
      province: 'East New Britain',
      city: 'Rabaul',
      latitude: -4.2000,
      longitude: 152.1833,
      address: 'Tokua Airport, East New Britain Province',
      description: 'Explore the volcanic wonders of Rabaul with our reliable fleet. Volcano tours and local sightseeing.',
      phone: '+675-982-7654',
      email: 'info@rabaulcarhire.com.pg',
      vehicleType: 'Van',
      passengerCapacity: 12,
      pricePerDay: 95.00,
      priceRange: PriceRange.Moderate,
      features: ['AC', 'GPS', 'Insurance', '24/7 Support', 'Airport Pickup', 'Group Transport'],
      images: ['/images/hirecar-van-1.jpg', '/images/hirecar-van-2.jpg'],
      featuredImage: '/images/hirecar-van-1.jpg',
      verified: false,
      featured: false,
      active: true,
    },
  ];

  for (const hc of sampleHireCars) {
    try {
      // Check if hire car already exists
      const existing = await prisma.hireCar.findFirst({
        where: { name: hc.name }
      });
      if (!existing) {
        await prisma.hireCar.create({ data: hc });
        console.log(`✅ Seeded hire car: ${hc.name}`);
      } else {
        console.log(`⚠️ Hire car already exists: ${hc.name}`);
      }
    } catch (error) {
      console.warn('⚠️ Skipped seeding hire car (model missing?):', hc.name, error);
    }
  }

  console.log('🎉 Database seed completed successfully!');
  console.log(`📊 Total destinations: ${destinations.length}`);
  console.log(`🏨 Total hotels: ${sampleHotels.length}`);
  console.log(`🚗 Total hire cars: ${sampleHireCars.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
