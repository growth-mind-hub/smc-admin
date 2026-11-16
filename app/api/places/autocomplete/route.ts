import { NextRequest, NextResponse } from "next/server";

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

// In-memory server-side cache (TTL: 15 minutes)
interface CacheEntry {
  timestamp: number;
  data: PlaceSuggestion[];
}

const SERVER_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Curated Singapore fallback locations if Google Places API Key is not set or rate-limited
const SINGAPORE_POPULAR_PLACES: PlaceSuggestion[] = [
  {
    placeId: "sg-changi-t1",
    description: "Singapore Changi Airport Terminal 1, Airport Boulevard, Singapore",
    mainText: "Singapore Changi Airport (SIN) Terminal 1",
    secondaryText: "Airport Boulevard, Singapore",
  },
  {
    placeId: "sg-changi-t2",
    description: "Singapore Changi Airport Terminal 2, Airport Boulevard, Singapore",
    mainText: "Singapore Changi Airport (SIN) Terminal 2",
    secondaryText: "Airport Boulevard, Singapore",
  },
  {
    placeId: "sg-changi-t3",
    description: "Singapore Changi Airport Terminal 3, Airport Boulevard, Singapore",
    mainText: "Singapore Changi Airport (SIN) Terminal 3",
    secondaryText: "Airport Boulevard, Singapore",
  },
  {
    placeId: "sg-changi-t4",
    description: "Singapore Changi Airport Terminal 4, Airport Boulevard, Singapore",
    mainText: "Singapore Changi Airport (SIN) Terminal 4",
    secondaryText: "Airport Boulevard, Singapore",
  },
  {
    placeId: "sg-jewel-changi",
    description: "Jewel Changi Airport, 78 Airport Boulevard, Singapore",
    mainText: "Jewel Changi Airport",
    secondaryText: "78 Airport Boulevard, Singapore 819666",
  },
  {
    placeId: "sg-mbs",
    description: "Marina Bay Sands Singapore, 10 Bayfront Avenue, Singapore",
    mainText: "Marina Bay Sands",
    secondaryText: "10 Bayfront Avenue, Singapore 018956",
  },
  {
    placeId: "sg-gardens-bay",
    description: "Gardens by the Bay, 18 Marina Gardens Drive, Singapore",
    mainText: "Gardens by the Bay",
    secondaryText: "18 Marina Gardens Drive, Singapore 018953",
  },
  {
    placeId: "sg-sentosa-rws",
    description: "Resorts World Sentosa, 8 Sentosa Gateway, Singapore",
    mainText: "Resorts World Sentosa",
    secondaryText: "8 Sentosa Gateway, Sentosa Island, Singapore 098269",
  },
  {
    placeId: "sg-uss",
    description: "Universal Studios Singapore, 8 Sentosa Gateway, Singapore",
    mainText: "Universal Studios Singapore",
    secondaryText: "Sentosa Island, Singapore",
  },
  {
    placeId: "sg-orchard-road",
    description: "Orchard Road Shopping Belt, Orchard Road, Singapore",
    mainText: "Orchard Road",
    secondaryText: "Orchard, Singapore",
  },
  {
    placeId: "sg-ion-orchard",
    description: "ION Orchard, 2 Orchard Turn, Singapore",
    mainText: "ION Orchard",
    secondaryText: "2 Orchard Turn, Singapore 238801",
  },
  {
    placeId: "sg-raffles-hotel",
    description: "Raffles Hotel Singapore, 1 Beach Road, Singapore",
    mainText: "Raffles Hotel Singapore",
    secondaryText: "1 Beach Road, Singapore 189673",
  },
  {
    placeId: "sg-marina-cruise",
    description: "Marina Bay Cruise Centre Singapore, 61 Marina Coastal Drive, Singapore",
    mainText: "Marina Bay Cruise Centre (MBCCS)",
    secondaryText: "61 Marina Coastal Drive, Singapore 018947",
  },
  {
    placeId: "sg-singapore-cruise",
    description: "Singapore Cruise Centre, 1 Maritime Square, Singapore",
    mainText: "Singapore Cruise Centre (HarbourFront)",
    secondaryText: "1 Maritime Square, Singapore 099253",
  },
  {
    placeId: "sg-clarke-quay",
    description: "Clarke Quay, 3 River Valley Road, Singapore",
    mainText: "Clarke Quay",
    secondaryText: "River Valley Road, Singapore 179024",
  },
  {
    placeId: "sg-suntec-city",
    description: "Suntec City & Convention Centre, 3 Temasek Boulevard, Singapore",
    mainText: "Suntec City",
    secondaryText: "3 Temasek Boulevard, Singapore 038983",
  },
  {
    placeId: "sg-singapore-flyer",
    description: "Singapore Flyer, 30 Raffles Avenue, Singapore",
    mainText: "Singapore Flyer",
    secondaryText: "30 Raffles Avenue, Singapore 039803",
  },
  {
    placeId: "sg-woodlands-checkpoint",
    description: "Woodlands Checkpoint, Woodlands Crossing, Singapore",
    mainText: "Woodlands Checkpoint",
    secondaryText: "Woodlands Crossing, Singapore 738203",
  },
  {
    placeId: "sg-tuas-checkpoint",
    description: "Tuas Checkpoint, 501 Jalan Ahmad Ibrahim, Singapore",
    mainText: "Tuas Checkpoint",
    secondaryText: "501 Jalan Ahmad Ibrahim, Singapore 639937",
  },
  {
    placeId: "sg-seletar-airport",
    description: "Seletar Airport (XSP), 21 Seletar Aerospace Road 1, Singapore",
    mainText: "Seletar Airport (XSP)",
    secondaryText: "21 Seletar Aerospace Road 1, Singapore 797405",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = (body?.input || "").trim();

    if (!input || input.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        source: "empty_query",
      });
    }

    const cacheKey = input.toLowerCase();

    // 1. Check Server In-Memory Cache
    const cached = SERVER_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        suggestions: cached.data,
        source: "server_cache",
      });
    }

    // 2. Resolve Google API Key (kept strictly on server side)
    const apiKey =
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY;

    if (apiKey) {
      try {
        const googleRes = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "*",
          },
          body: JSON.stringify({
            input,
            includedRegionCodes: ["sg"],
            languageCode: "en",
          }),
          cache: "no-store",
        });

        if (googleRes.ok) {
          const googleData = await googleRes.json();
          const rawPredictions = googleData.suggestions || [];

          const suggestions: PlaceSuggestion[] = rawPredictions
            .map((item: any) => {
              const pred = item.placePrediction || {};
              const placeId =
                pred.placeId ||
                (pred.place ? pred.place.replace("places/", "") : "") ||
                `sg-${Math.random()}`;
              const mainText =
                pred.structuredFormat?.mainText?.text ||
                pred.text?.text ||
                input;
              const secondaryText =
                pred.structuredFormat?.secondaryText?.text || "Singapore";
              const description =
                pred.text?.text ||
                (secondaryText ? `${mainText}, ${secondaryText}` : mainText);

              return {
                placeId,
                description,
                mainText,
                secondaryText,
              };
            })
            .filter((s: PlaceSuggestion) => Boolean(s.mainText || s.description));

          // Cache results
          SERVER_CACHE.set(cacheKey, {
            timestamp: Date.now(),
            data: suggestions,
          });

          return NextResponse.json({
            success: true,
            suggestions,
            source: "google_places_api",
          });
        } else {
          const errText = await googleRes.text().catch(() => "");
          console.warn(
            `Google Places API returned status ${googleRes.status}: ${errText}. Falling back to curated directory.`
          );
        }
      } catch (apiErr) {
        console.error("Error connecting to Google Places API:", apiErr);
      }
    }

    // 3. Fallback: Filter curated Singapore Places
    const lowerInput = input.toLowerCase();
    const fallbackResults = SINGAPORE_POPULAR_PLACES.filter(
      (p) =>
        p.mainText.toLowerCase().includes(lowerInput) ||
        p.description.toLowerCase().includes(lowerInput) ||
        p.secondaryText.toLowerCase().includes(lowerInput)
    );

    // If query didn't match pre-populated list, create a direct custom option
    const resultList =
      fallbackResults.length > 0
        ? fallbackResults
        : [
            {
              placeId: `custom-${Date.now()}`,
              description: `${input}, Singapore`,
              mainText: input,
              secondaryText: "Singapore",
            },
          ];

    // Store in cache
    SERVER_CACHE.set(cacheKey, {
      timestamp: Date.now(),
      data: resultList,
    });

    return NextResponse.json({
      success: true,
      suggestions: resultList,
      source: apiKey ? "fallback_after_api_error" : "local_singapore_directory",
    });
  } catch (error: any) {
    console.error("Autocomplete Handler Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "AUTOCOMPLETE_ERROR",
        message: error?.message || "Internal server error during place autocomplete",
        suggestions: [],
      },
      { status: 500 }
    );
  }
}
