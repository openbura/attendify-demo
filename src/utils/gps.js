export const DEFAULT_SITE_GPS_SETTINGS = {
  siteId: "dania",
  siteName: "דניה ווסט הוד השרון",
  siteAddress: "עמק איילון 1, כפר סבא",
  latitude: 32.179343,
  longitude: 34.931399,
  radiusMeters: 500,
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
let googleMapsPromise;

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

  const maps = await getGoogleMapsApi();
  if (maps?.Geocoder) {
    return geocodeWithGoogle(new maps.Geocoder(), trimmedAddress);
  }

  const suggestions = await searchAddressSuggestionsWithNominatim(trimmedAddress);
  if (!suggestions[0] || !Number.isFinite(suggestions[0].latitude) || !Number.isFinite(suggestions[0].longitude)) {
    throw new Error("Address was not found.");
  }

  return suggestions[0];
}

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const error = new Error("Geolocation is not supported.");
      error.code = 0;
      reject(error);
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
        timeout: 15000,
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
