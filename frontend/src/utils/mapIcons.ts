import L from 'leaflet'

export function createMarkerIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<span style="background:${color}" class="block size-4 rounded-full border-2 border-white shadow-md"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  })
}

export function createUserLocationIcon() {
  return L.divIcon({
    className: '',
    html: '<span class="block size-4 rounded-full bg-primary-500 border-2 border-white shadow-md ring-4 ring-primary-500/30"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}
