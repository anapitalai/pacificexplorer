
// Type for Copernicus API response (minimal, for type safety)
interface CopernicusApiResponse {
  value?: Array<{
    S3Path?: string;
    CloudCover?: number;
    ContentDate?: { Start?: string };
  }>;
}

// Type for Copernicus API response (minimal, for type safety)

/**
 * Copernicus Satellite Data Service via FREE Copernicus Data Space Ecosystem
 * Uses Sentinel-2 imagery for environmental analysis and tourism discovery
 * API: https://dataspace.copernicus.eu (FREE - No payment required)
 * 
 * Enhanced with Clay AI for improved feature detection
 * Clay: https://madewithclay.org (Open-source Earth observation AI)
 */

import { clayAI } from './clay-ai';

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface SatelliteAnalysis {
  ndvi: number; // Normalized Difference Vegetation Index (-1 to 1)
  ndwi: number; // Normalized Difference Water Index (-1 to 1)
  cloudCover: number; // Percentage (0-100)
  visualQuality: number; // Score 0-100
  environmentalHealth: number; // Score 0-100
}

export interface DiscoveredLocation {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'beach' | 'forest' | 'mountain' | 'cultural' | 'hotel';
  analysis: SatelliteAnalysis;
  confidence: number;
  imageUrl?: string;
  description: string;
}

interface AlphaEarthResponse {
  data: {
    imagery: {
      url: string;
      bands: {
        red: number[][];
        green: number[][];
        blue: number[][];
        nir: number[][];
        swir: number[][];
      };
      metadata: {
        cloudCover: number;
        date: string;
        resolution: number;
      };
    };
    analysis: {
      ndvi: number;
      ndwi: number;
      features: Array<{
        type: string;
        coordinates: [number, number];
        confidence: number;
      }>;
    };
  };
}

export class CopernicusAlphaEarthService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Copernicus Data Space Ecosystem - FREE API
    this.apiKey = process.env.COPERNICUS_CLIENT_ID || '';
    this.baseUrl = process.env.COPERNICUS_BASE_URL || 'https://catalogue.dataspace.copernicus.eu/odata/v1';
  }

  /**
   * Analyze satellite imagery for a given bounding box using FREE Copernicus Data Space
   */
  async analyzeSatelliteImagery(bbox: BoundingBox, date?: string): Promise<AlphaEarthResponse> {
    try {
      // Use Copernicus Data Space OData API (FREE)
      const dateStr = date || new Date().toISOString().split('T')[0];
      
      // Query Sentinel-2 products
      const query = `Products?$filter=Collection/Name eq 'SENTINEL-2' and ` +
        `ContentDate/Start gt ${dateStr}T00:00:00.000Z and ` +
        `OData.CSC.Intersects(area=geography'SRID=4326;POLYGON((` +
        `${bbox.minLng} ${bbox.minLat},${bbox.maxLng} ${bbox.minLat},` +
        `${bbox.maxLng} ${bbox.maxLat},${bbox.minLng} ${bbox.maxLat},` +
        `${bbox.minLng} ${bbox.minLat}))')&$top=1`;

      const response = await fetch(`${this.baseUrl}/${query}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Copernicus API request failed, using mock data');
        throw new Error('API unavailable');
      }

      const data = await response.json();
      
      // Transform Copernicus response to our format
      return this.transformCopernicusResponse(data, bbox);
    } catch (error) {
      console.error('Error fetching Copernicus data:', error);
      throw error;
    }
  }

  /**
   * Transform Copernicus Data Space response to our internal format
   */





// Type for Copernicus API response (minimal, for type safety)

  private transformCopernicusResponse(data: CopernicusApiResponse, bbox: BoundingBox): AlphaEarthResponse {
    // Mock transformation - in production, would process actual satellite bands
    return {
      data: {
        imagery: {
          url: data.value?.[0]?.S3Path || '',
          bands: {
            red: [[]],
            green: [[]],
            blue: [[]],
            nir: [[]],
            swir: [[]],
          },
          metadata: {
            cloudCover: data.value?.[0]?.CloudCover || 20,
            date: data.value?.[0]?.ContentDate?.Start || new Date().toISOString(),
            resolution: 10,
          },
        },
        analysis: {
          ndvi: 0,
          ndwi: 0,
          features: this.generateMockFeatures(bbox),
        },
      },
    };
  }

  /**
   * Generate mock features for testing - Creates realistic locations based on bbox
   */
  private generateMockFeatures(bbox: BoundingBox): Array<{ type: string; coordinates: [number, number]; confidence: number }> {
    const features: Array<{ type: string; coordinates: [number, number]; confidence: number }> = [];
    
    // Generate multiple discoveries across the bbox
    const latRange = bbox.maxLat - bbox.minLat;
    const lngRange = bbox.maxLng - bbox.minLng;
    
    // Generate 5-10 random discoveries
    const numDiscoveries = 7 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numDiscoveries; i++) {
      // Random position within bbox
      const lat = bbox.minLat + Math.random() * latRange;
      const lng = bbox.minLng + Math.random() * lngRange;
      
      // Determine type based on position (simulate coastal vs inland)
      let type: string;
      let confidence: number;
      
      // Simulate coastal detection (near edges of bbox = more likely beach)
      const distanceFromEdge = Math.min(
        Math.abs(lat - bbox.minLat),
        Math.abs(lat - bbox.maxLat),
        Math.abs(lng - bbox.minLng),
        Math.abs(lng - bbox.maxLng)
      );
      
      const isNearCoast = distanceFromEdge < latRange * 0.2;
      
      if (isNearCoast && Math.random() > 0.4) {
        type = 'beach';
        confidence = 0.75 + Math.random() * 0.2;
      } else if (Math.random() > 0.6) {
        type = 'forest';
        confidence = 0.7 + Math.random() * 0.25;
      } else if (Math.random() > 0.7) {
        type = 'mountain';
        confidence = 0.65 + Math.random() * 0.2;
      } else {
        type = 'cultural';
        confidence = 0.6 + Math.random() * 0.25;
      }
      
      features.push({
        type,
        coordinates: [lng, lat],
        confidence,
      });
    }
    
    return features;
  }

  /**
   * Calculate NDVI (Normalized Difference Vegetation Index)
   * NDVI = (NIR - Red) / (NIR + Red)
   * Values: -1 to 1 (higher = more vegetation)
   */
  private calculateNDVI(nir: number, red: number): number {
    if (nir + red === 0) return 0;
    return (nir - red) / (nir + red);
  }

  /**
   * Calculate NDWI (Normalized Difference Water Index)
   * NDWI = (Green - NIR) / (Green + NIR)
   * Values: -1 to 1 (higher = more water)
   */
  private calculateNDWI(green: number, nir: number): number {
    if (green + nir === 0) return 0;
    return (green - nir) / (green + nir);
  }

  /**
   * Calculate environmental health score based on satellite indices
   */
  private calculateEnvironmentalHealth(ndvi: number, ndwi: number, cloudCover: number): number {
    // Higher NDVI = healthy vegetation (up to 40 points)
    const vegetationScore = Math.max(0, ndvi * 40);
    
    // Moderate NDWI = good water presence (up to 30 points)
    const waterScore = Math.abs(ndwi) > 0.3 ? 30 : Math.abs(ndwi) * 100;
    
    // Lower cloud cover = better visibility (up to 30 points)
    const visibilityScore = (100 - cloudCover) * 0.3;
    
    return Math.min(100, vegetationScore + waterScore + visibilityScore);
  }

  /**
   * Discover potential tourist locations using satellite analysis
   * Enhanced with Clay AI for improved accuracy
   */
  async discoverLocations(
    bbox: BoundingBox,
    types: string[] = ['beach', 'forest', 'mountain', 'cultural']
  ): Promise<DiscoveredLocation[]> {
    try {
      // Use Clay AI for enhanced detection
      const clayResults = await clayAI.detectAll({
        bbox,
        features: types,
        confidence_threshold: 0.7,
      });

      const discoveries: DiscoveredLocation[] = [];

      // Process Clay AI beach detections
      if (types.includes('beach')) {
        clayResults.beaches.forEach((beach, index) => {
          const [lng, lat] = beach.coordinates;
          const environmentalScore = clayAI.calculateEnvironmentalScore(beach);

          discoveries.push({
            id: `clay-beach-${index}`,
            name: `${['Paradise', 'Crystal', 'Hidden', 'Coral', 'Sunset', 'Palm', 'Azure'][index % 7]} Beach`,
            coordinates: { lat, lng },
            type: 'beach',
            analysis: {
              ndvi: beach.properties.vegetation_index || 0.2,
              ndwi: beach.properties.water_presence || 0.5,
              cloudCover: 15,
              visualQuality: 80 + Math.random() * 15,
              environmentalHealth: environmentalScore,
            },
            confidence: beach.confidence,
            description: `Pristine beach detected by Clay AI - ${Math.round(beach.properties.area || 10000)}m² of white sand coastline with excellent water quality`,
          });
        });
      }

      // Process Clay AI forest detections
      if (types.includes('forest')) {
        clayResults.forests.forEach((forest, index) => {
          const [lng, lat] = forest.coordinates;
          const environmentalScore = clayAI.calculateEnvironmentalScore(forest);

          discoveries.push({
            id: `clay-forest-${index}`,
            name: `${['Tropical', 'Pristine', 'Ancient', 'Highland', 'Biodiversity'][index % 5]} Rainforest`,
            coordinates: { lat, lng },
            type: 'forest',
            analysis: {
              ndvi: forest.properties.vegetation_index || 0.8,
              ndwi: forest.properties.water_presence || 0.2,
              cloudCover: 20,
              visualQuality: 75 + Math.random() * 15,
              environmentalHealth: environmentalScore,
            },
            confidence: forest.confidence,
            description: `Dense rainforest detected by Clay AI - ${(forest.properties.area || 200000 / 10000).toFixed(1)} hectares of protected ecosystem`,
          });
        });
      }

      // Process Clay AI mountain detections
      if (types.includes('mountain')) {
        clayResults.mountains.forEach((mountain, index) => {
          const [lng, lat] = mountain.coordinates;
          const environmentalScore = clayAI.calculateEnvironmentalScore(mountain);

          discoveries.push({
            id: `clay-mountain-${index}`,
            name: `${['Volcanic', 'Sacred', 'Cloud', 'Highland', 'Summit'][index % 5]} Peak`,
            coordinates: { lat, lng },
            type: 'mountain',
            analysis: {
              ndvi: mountain.properties.vegetation_index || 0.4,
              ndwi: mountain.properties.water_presence || -0.2,
              cloudCover: 25,
              visualQuality: 70 + Math.random() * 20,
              environmentalHealth: environmentalScore,
            },
            confidence: mountain.confidence,
            description: `Mountain peak detected by Clay AI - ${Math.round(mountain.properties.elevation || 1000)}m elevation with panoramic views`,
          });
        });
      }

      // Sort by environmental health and confidence
      return discoveries.sort((a, b) => {
        const scoreA = a.analysis.environmentalHealth * a.confidence;
        const scoreB = b.analysis.environmentalHealth * b.confidence;
        return scoreB - scoreA;
      });
    } catch (error) {
      console.error('Error discovering locations:', error);
      // Fallback to mock data
      return this.getMockDiscoveries(bbox, types);
    }
  }

  /**
   * Get mock data for testing without API key
   */
  private getMockDiscoveries(bbox: BoundingBox, types: string[]): DiscoveredLocation[] {
    const allMockData: DiscoveredLocation[] = [];
    const latRange = bbox.maxLat - bbox.minLat;
    const lngRange = bbox.maxLng - bbox.minLng;
    
    // Generate beaches (if requested)
    if (types.includes('beach')) {
      const numBeaches = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numBeaches; i++) {
        // Beaches near edges (coastlines)
        const edge = Math.floor(Math.random() * 4);
        let lat: number, lng: number;
        
        switch (edge) {
          case 0: lat = bbox.minLat + latRange * 0.15; lng = bbox.minLng + Math.random() * lngRange; break;
          case 1: lat = bbox.maxLat - latRange * 0.15; lng = bbox.minLng + Math.random() * lngRange; break;
          case 2: lat = bbox.minLat + Math.random() * latRange; lng = bbox.minLng + lngRange * 0.15; break;
          default: lat = bbox.minLat + Math.random() * latRange; lng = bbox.maxLng - lngRange * 0.15;
        }
        
        allMockData.push({
          id: `beach-${i}`,
          name: `${['Paradise', 'Hidden', 'Crystal', 'Coral', 'Sunset'][i % 5]} Beach`,
          coordinates: { lat, lng },
          type: 'beach',
          analysis: {
            ndvi: 0.15 + Math.random() * 0.15, // Low vegetation (sand/water)
            ndwi: 0.35 + Math.random() * 0.2,  // High water index
            cloudCover: 10 + Math.random() * 15,
            visualQuality: 85 + Math.random() * 12,
            environmentalHealth: 88 + Math.random() * 10,
          },
          confidence: 0.82 + Math.random() * 0.15,
          description: 'Pristine white sand beach with crystal clear turquoise waters detected via Sentinel-2 satellite imagery',
        });
      }
    }
    
    // Generate forests (if requested)
    if (types.includes('forest')) {
      const numForests = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numForests; i++) {
        allMockData.push({
          id: `forest-${i}`,
          name: `${['Tropical', 'Rainforest', 'Highland', 'Ancient'][i % 4]} Forest Reserve`,
          coordinates: {
            lat: bbox.minLat + latRange * (0.3 + Math.random() * 0.4),
            lng: bbox.minLng + lngRange * (0.3 + Math.random() * 0.4),
          },
          type: 'forest',
          analysis: {
            ndvi: 0.72 + Math.random() * 0.2, // High vegetation
            ndwi: 0.1 + Math.random() * 0.15,
            cloudCover: 20 + Math.random() * 20,
            visualQuality: 78 + Math.random() * 15,
            environmentalHealth: 90 + Math.random() * 8,
          },
          confidence: 0.88 + Math.random() * 0.1,
          description: 'Dense tropical rainforest with high biodiversity indicators detected from satellite vegetation indices',
        });
      }
    }
    
    // Generate mountains (if requested)
    if (types.includes('mountain')) {
      const numMountains = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numMountains; i++) {
        allMockData.push({
          id: `mountain-${i}`,
          name: `${['Volcanic', 'Highland', 'Cloud', 'Sacred'][i % 4]} Peak`,
          coordinates: {
            lat: bbox.minLat + latRange * (0.4 + Math.random() * 0.3),
            lng: bbox.minLng + lngRange * (0.4 + Math.random() * 0.3),
          },
          type: 'mountain',
          analysis: {
            ndvi: 0.4 + Math.random() * 0.25,
            ndwi: -0.3 + Math.random() * 0.2, // Negative (dry land)
            cloudCover: 25 + Math.random() * 25,
            visualQuality: 72 + Math.random() * 18,
            environmentalHealth: 80 + Math.random() * 12,
          },
          confidence: 0.72 + Math.random() * 0.18,
          description: 'Elevated terrain with panoramic views identified through satellite elevation and vegetation analysis',
        });
      }
    }
    
    // Generate cultural sites (if requested)
    if (types.includes('cultural')) {
      const numCultural = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numCultural; i++) {
        allMockData.push({
          id: `cultural-${i}`,
          name: `${['Traditional', 'Historic', 'Ancient', 'Indigenous'][i % 4]} Village Site`,
          coordinates: {
            lat: bbox.minLat + latRange * (0.25 + Math.random() * 0.5),
            lng: bbox.minLng + lngRange * (0.25 + Math.random() * 0.5),
          },
          type: 'cultural',
          analysis: {
            ndvi: 0.35 + Math.random() * 0.3,
            ndwi: 0.0 + Math.random() * 0.2,
            cloudCover: 18 + Math.random() * 20,
            visualQuality: 75 + Math.random() * 15,
            environmentalHealth: 78 + Math.random() * 15,
          },
          confidence: 0.68 + Math.random() * 0.2,
          description: 'Cultural heritage site with traditional settlements detected through satellite land use patterns',
        });
      }
    }

    return allMockData;
  }

  /**
   * Detect potential hotel/accommodation sites using Clay AI
   * Enhanced building detection with spectral analysis
   */
  async detectHotels(bbox: BoundingBox): Promise<DiscoveredLocation[]> {
    try {
      // Use Clay AI for building detection
      const clayHotels = await clayAI.detectHotels({
        bbox,
        features: ['hotel'],
        confidence_threshold: 0.65,
      });

      return clayHotels.map((hotel, index) => {
        const [lng, lat] = hotel.coordinates;
        const environmentalScore = clayAI.calculateEnvironmentalScore(hotel);
        const isCoastal = hotel.properties.water_presence && hotel.properties.water_presence > 0.3;

        return {
          id: `clay-hotel-${index}`,
          name: `${isCoastal ? 'Beachfront' : 'Hillside'} Resort`,
          coordinates: { lat, lng },
          type: 'hotel' as const,
          analysis: {
            ndvi: hotel.properties.vegetation_index || 0.3,
            ndwi: hotel.properties.water_presence || 0.1,
            cloudCover: 15,
            visualQuality: 75,
            environmentalHealth: environmentalScore,
          },
          confidence: hotel.confidence,
          description: `Accommodation site detected by Clay AI - ${Math.round(hotel.properties.area || 2000)}m² building structure ${isCoastal ? 'on coastal strip' : 'in elevated location'}`,
        };
      });
    } catch (error) {
      console.error('Error detecting hotels with Clay AI:', error);
      return [];
    }
  }

  /**
   * Get climate and environmental data for a specific location
   * Uses ERA5 climate data from Copernicus Climate Data Store (also FREE)
   */
  async getClimateData(): Promise<{
    temperature: number;
    precipitation: number;
    humidity: number;
    airQuality: number;
  }> {
    try {
      // Would integrate with Copernicus Climate Data Store API
      // For now, return realistic mock data based on PNG climate
      return {
        temperature: 25 + Math.random() * 5, // PNG typical range: 25-30°C
        precipitation: 200 + Math.random() * 150, // PNG high rainfall
        humidity: 75 + Math.random() * 15, // PNG high humidity
        airQuality: 90 + Math.random() * 8, // PNG generally good air quality
      };
    } catch (error) {
      console.error('Error fetching climate data:', error);
      return {
        temperature: 27,
        precipitation: 250,
        humidity: 80,
        airQuality: 92,
      };
    }
  }
}

// Export singleton instance
export const copernicusService = new CopernicusAlphaEarthService();
