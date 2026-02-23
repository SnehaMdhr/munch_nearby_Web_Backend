import axios from "axios";

export const geocodeAddress = async (address: string) => {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: address,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "restaurant-app"
      }
    }
  );

  if (!response.data.length) return null;

  return {
    latitude: parseFloat(response.data[0].lat),
    longitude: parseFloat(response.data[0].lon),
  };
};