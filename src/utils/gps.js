export const DEFAULT_SITE_GPS_SETTINGS = {
  siteId: "naomi-shemer",
  siteName: "פרוייקט נעמי שמר",
  siteAddress: "נעמי שמר 2, הוד השרון",
  latitude: 32.1474603,
  longitude: 34.8893482,
  radiusMeters: 250,
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
export const GEOLOCATION_ERROR_CODES = {
  INSECURE_CONTEXT: "INSECURE_CONTEXT",
  UNSUPPORTED: "UNSUPPORTED",
};
export const GPS_REQUEST_TIMEOUT_MS = 20000;
let googleMapsPromise;

const knownAddressCoordinates = [
  {
    keywords: ["פרוייקט נעמי שמר", "נעמי שמר 2", "הוד השרון", "naomi shemer 2", "hod hasharon"],
    address: "נעמי שמר 2, הוד השרון",
    latitude: 32.1474603,
    longitude: 34.8893482,
  },
  {
    keywords: ["פרוייקט אבגד", "אבגד", "גולומב 38", "רמת השרון", "golomb 38", "ramat hasharon"],
    address: "גולומב 38, רמת השרון",
    latitude: 32.1441405,
    longitude: 34.8398525,
  },
  {
    keywords: ["פרוייקט חברת חשמל", "חברת חשמל", "לכיש 69", "קריית ים", "קרית ים", "lakhish 69", "kiryat yam"],
    address: "לכיש 69, קריית ים",
    latitude: 32.853151,
    longitude: 35.0828546,
  },
  {
    keywords: ["פורמה תל אביב", "פורמה", "הברון הירש 3", "תל אביב", "baron hirsch 3", "tel aviv"],
    address: "הברון הירש 3, תל אביב",
    latitude: 32.110132,
    longitude: 34.796307,
  },
];

function findKnownAddress(query) {
  const normalizedQuery = query.trim().toLowerCase();
  return knownAddressCoordinates.find((item) =>
    item.keywords.some((keyword) => normalizedQuery.includes(keyword.toLowerCase())),
  );
}

export function hasGoogleMapsApiKey() {
  return Boolean(GOOGLE_MAPS_API_KEY);
}

function getGoogleMapsApi() {
  if (window.google?.maps?.places && window.google?.maps?.Geocoder) return Promise.resolve(window.google.maps);
  if (!GOOGLE_MAPS_API_KEY) return Promise.resolve(null);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-connex-google-maps="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google?.maps || null), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=places&language=he&region=IL&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.connexGoogleMaps = "true";
    script.addEventListener("load", () => resolve(window.google?.maps || null), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

function getAutocompletePredictions(service, request) {
  return new Promise((resolve) => {
    service.getPlacePredictions(request, (predictions, status) => {
      const okStatuses = [window.google.maps.places.PlacesServiceStatus.OK, "OK"];
      resolve(okStatuses.includes(status) && Array.isArray(predictions) ? predictions : []);
    });
  });
}

function geocodeWithGoogle(geocoder, address) {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address, region: "IL" }, (results, status) => {
      const okStatuses = [window.google.maps.GeocoderStatus.OK, "OK"];
      if (!okStatuses.includes(status) || !results?.[0]) {
        reject(new Error("Address was not found."));
        return;
      }

      const location = results[0].geometry.location;
      resolve({
        address: results[0].formatted_address || address,
        latitude: location.lat(),
        longitude: location.lng(),
        provider: "google",
      });
    });
  });
}

async function searchAddressSuggestionsWithNominatim(query) {
  const knownAddress = findKnownAddress(query);
  if (knownAddress) {
    return [{
      id: knownAddress.address,
      description: knownAddress.address,
      latitude: knownAddress.latitude,
      longitude: knownAddress.longitude,
      provider: "local",
    }];
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=il&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return [];
  const results = await response.json();
  return results.map((item) => ({
    id: item.place_id,
    description: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    provider: "openstreetmap",
  }));
}

export async function searchAddressSuggestions(query) {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 3) return [];

  const maps = await getGoogleMapsApi();
  if (maps?.places?.AutocompleteService) {
    const service = new maps.places.AutocompleteService();
    const predictions = await getAutocompletePredictions(service, {
      input: trimmedQuery,
      componentRestrictions: { country: "il" },
      types: ["address"],
    });
    return predictions.map((prediction) => ({
      id: prediction.place_id,
      description: prediction.description,
      provider: "google",
    }));
  }

  return searchAddressSuggestionsWithNominatim(trimmedQuery);
}

export async function geocodeAddress(address) {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) throw new Error("Address is empty.");

  const knownAddress = findKnownAddress(trimmedAddress);
  if (knownAddress) {
    return {
      address: knownAddress.address,
      latitude: knownAddress.latitude,
      longitude: knownAddress.longitude,
      provider: "local",
    };
  }

  const maps = await getGoogleMapsApi();
  if (maps?.Geocoder) {
    return geocodeWithGoogle(new maps.Geocoder(), trimmedAddress);
  }

  let suggestions = [];
  try {
    suggestions = await searchAddressSuggestionsWithNominatim(trimmedAddress);
  } catch {
    suggestions = [];
  }
  if (!suggestions[0] || !Number.isFinite(suggestions[0].latitude) || !Number.isFinite(suggestions[0].longitude)) {
    throw new Error("Address was not found.");
  }

  return suggestions[0];
}

function createGeolocationError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function getDevGpsTestMode() {
  if (!import.meta.env.DEV || typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("connexGpsTest") || "";
}

export function isDevGpsTestModeActive() {
  return Boolean(getDevGpsTestMode());
}

function getDevGpsTestLocation(mode) {
  const locations = {
    "outside-assigned": { latitude: 32.110132, longitude: 34.796307, accuracy: 8 },
    "inside-forma": { latitude: 32.110132, longitude: 34.796307, accuracy: 8 },
    "inside-naomi": { latitude: 32.1474603, longitude: 34.8893482, accuracy: 8 },
    "inside-avgad": { latitude: 32.1441405, longitude: 34.8398525, accuracy: 8 },
    "inside-electric": { latitude: 32.853151, longitude: 35.0828546, accuracy: 8 },
  };
  return locations[mode] || null;
}

function getDevGpsTestError(mode) {
  const errors = {
    "permission-denied": createGeolocationError("Dev GPS test: permission denied.", 1),
    unavailable: createGeolocationError("Dev GPS test: GPS unavailable.", 2),
    timeout: createGeolocationError("Dev GPS test: GPS timeout.", 3),
    insecure: createGeolocationError("Dev GPS test: insecure context.", GEOLOCATION_ERROR_CODES.INSECURE_CONTEXT),
  };
  return errors[mode] || null;
}

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    const devGpsTestMode = getDevGpsTestMode();
    const devGpsTestError = getDevGpsTestError(devGpsTestMode);
    if (devGpsTestError) {
      reject(devGpsTestError);
      return;
    }

    const devGpsTestLocation = getDevGpsTestLocation(devGpsTestMode);
    if (devGpsTestLocation) {
      resolve(devGpsTestLocation);
      return;
    }

    if (typeof window !== "undefined" && window.isSecureContext === false) {
      reject(createGeolocationError("Geolocation requires a secure context.", GEOLOCATION_ERROR_CODES.INSECURE_CONTEXT));
      return;
    }

    if (!navigator.geolocation) {
      reject(createGeolocationError("Geolocation is not supported.", GEOLOCATION_ERROR_CODES.UNSUPPORTED));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: GPS_REQUEST_TIMEOUT_MS,
        maximumAge: 30000,
      },
    );
  });
}

export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const earthRadiusMeters = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const startLat = toRadians(lat1);
  const endLat = toRadians(lat2);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLon / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function isWithinAllowedRadius(currentLocation, siteLocation, radiusMeters) {
  const distanceMeters = calculateDistanceMeters(
    currentLocation.latitude,
    currentLocation.longitude,
    siteLocation.latitude,
    siteLocation.longitude,
  );

  return {
    distanceMeters,
    isWithinRadius: distanceMeters <= radiusMeters,
  };
}
