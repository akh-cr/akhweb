import { CityForm } from "../city-form"

export default function CreateCityPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Přidat nové město</h1>
      <CityForm />
    </div>
  )
}
