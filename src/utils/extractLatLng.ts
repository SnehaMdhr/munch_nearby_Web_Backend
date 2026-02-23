export const extractLatLng = (mapLink: string) => {
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = mapLink.match(regex);

  if (!match) return null;

  return {
    latitude: parseFloat(match[1]),
    longitude: parseFloat(match[2])
  };
};