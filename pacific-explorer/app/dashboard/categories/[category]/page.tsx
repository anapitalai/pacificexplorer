import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import BirdOfParadise from "@/components/BirdOfParadise";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  // Validate category
  const validCategories = ['Coastal', 'Inland', 'Geothermal', 'Cultural'];
  if (!validCategories.includes(decodedCategory)) {
    redirect('/dashboard');
  }

  // Fetch destinations for this category
  const destinations = await prisma.destination.findMany({
    where: {
      category: decodedCategory as Category,
    },
    select: {
      id: true,
      name: true,
      province: true,
      category: true,
      description: true,
      image: true,
      featured: true,
      latitude: true,
      longitude: true,
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' }
    ],
  });

  // Get category info
  const categoryInfo = getCategoryInfo(decodedCategory);

  return (
    <div className="min-h-screen bg-linear-to-br from-ocean-50 via-white to-paradise-sand/20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <BirdOfParadise className="w-12 h-12" />
              <span className="text-2xl font-bold text-png-black">
                Pacific <span className="text-png-red">Explorer</span>
              </span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-png-red transition-colors">
                ← Back to Dashboard
              </Link>
              <Link href="/dashboard" className="text-png-red font-semibold">
                Dashboard
              </Link>
              <Link href="/api/auth/signout" className="px-4 py-2 bg-png-red text-white rounded-lg hover:bg-opacity-90 transition-all">
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        <div className="mb-12">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-white text-sm font-semibold mb-4 ${categoryInfo.badgeColor}`}>
            <span>{categoryInfo.icon}</span>
            <span>{category}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-png-black mb-4">
            {categoryInfo.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {categoryInfo.description}
          </p>
        </div>

        {/* Destinations Grid */}
        {destinations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 bg-linear-to-br from-ocean-400 to-ocean-600">
                  {destination.featured && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1 bg-png-yellow text-png-black text-xs font-bold rounded-full flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>Featured</span>
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-png-black group-hover:text-png-red transition-colors mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{destination.province}</p>
                  {destination.description && (
                    <p className="text-gray-500 text-sm line-clamp-3">{destination.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-600 mb-6">There are no destinations in the {category} category yet.</p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-png-red text-white rounded-lg hover:bg-opacity-90 transition-all"
            >
              Explore Other Categories
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function getCategoryInfo(category: string) {
  const categoryMap: Record<string, {
    title: string;
    description: string;
    icon: string;
    badgeColor: string;
  }> = {
    Coastal: {
      title: "Coastal Adventures",
      description: "Discover pristine beaches, coral reefs, and marine wonders along Papua New Guinea's extensive coastline.",
      icon: "🏖️",
      badgeColor: "bg-ocean-500",
    },
    Inland: {
      title: "Inland Explorations",
      description: "Journey through majestic mountains, lush valleys, and diverse wildlife in PNG's interior landscapes.",
      icon: "🏔️",
      badgeColor: "bg-paradise-green",
    },
    Geothermal: {
      title: "Geothermal Wonders",
      description: "Experience volcanic landscapes, hot springs, and geothermal phenomena in PNG's active geological regions.",
      icon: "🌋",
      badgeColor: "bg-png-red",
    },
    Cultural: {
      title: "Cultural Heritage",
      description: "Immerse yourself in Papua New Guinea's rich cultural traditions, villages, and historical sites.",
      icon: "🏛️",
      badgeColor: "bg-png-yellow",
    },
  };

  return categoryMap[category] || {
    title: category,
    description: `Explore destinations in the ${category} category.`,
    icon: "📍",
    badgeColor: "bg-gray-500",
  };
}
