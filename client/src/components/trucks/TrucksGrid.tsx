import { TruckCard } from "@/components/trucks/TruckCard"

const trucksData = [
  {
    id: 1,
    brand: "Toyota Honda",
    plateNumber: "1234 - XYZ",
    orderCompleted: 346,
    location: "Shop A - Main Lagos",
    capacity: 500,
    driverAssigned: "Mr Tunde",
    status: "Available"
  },
  {
    id: 2,
    brand: "Ponta Hyundai",
    plateNumber: "1234 - XYZ",
    orderCompleted: 346,
    location: "Shop B - Port Harcourt",
    capacity: 500,
    driverAssigned: "Mr Cornelius",
    status: "Available"
  },
  {
    id: 3,
    brand: "Mercedes Benz",
    plateNumber: "1234 - XYZ",
    orderCompleted: 1800,
    location: "Shop C - Kano",
    capacity: 4300,
    driverAssigned: "Mr Shaibu",
    status: "Available"
  },
  {
    id: 4,
    brand: "Volvo Truck",
    plateNumber: "1234 - XYZ",
    orderCompleted: 520,
    location: "Shop D - Abuja",
    capacity: 600,
    driverAssigned: "Mr Ahmed",
    status: "Available"
  },
  {
    id: 5,
    brand: "MAN Truck",
    plateNumber: "1234 - XYZ",
    orderCompleted: 280,
    location: "Shop E - Ibadan",
    capacity: 450,
    driverAssigned: "Mr Johnson",
    status: "Available"
  }
]

export function TrucksGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {trucksData.map((truck) => (
        <TruckCard key={truck.id} truck={truck} />
      ))}
    </div>
  )
}
