import { MapPinOff } from 'lucide-react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import iconeUrl from 'leaflet/dist/images/marker-icon.png'
import iconeRetina from 'leaflet/dist/images/marker-icon-2x.png'
import iconeSombra from 'leaflet/dist/images/marker-shadow.png'

const icone = L.icon({
  iconUrl: iconeUrl,
  iconRetinaUrl: iconeRetina,
  shadowUrl: iconeSombra,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function PropertyMap({ latitude, longitude, titulo }) {
  if (!latitude || !longitude) {
    return (
      <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-500">
        <MapPinOff size={36} />
        <p className="text-sm">Localização no mapa indisponível para este imóvel.</p>
      </div>
    )
  }

  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={icone}>
          <Popup>{titulo}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
