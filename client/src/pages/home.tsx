import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const destinations = [
    {
      id: 1,
      name: "Krakow",
      image: "/images/krakow.svg",
      alt: "Krakow"
    },
    {
      id: 2,
      name: "Tatra Mountains",
      image: "/images/tatra.svg",
      alt: "Tatra Mountains"
    },
    {
      id: 3,
      name: "Gdansk",
      image: "/images/gdansk.svg",
      alt: "Gdansk"
    },
    {
      id: 4,
      name: "Bialowieza",
      image: "/images/bialowieza.svg",
      alt: "Bialowieza"
    }
  ];

  const travelGuides = [
    {
      id: 1,
      title: "3 Dagen in Krakau",
      image: "/images/krakau-dagtrip.svg",
      alt: "3 Dagen in Krakau"
    },
    {
      id: 2,
      title: "Roadtrip door het zuiden",
      image: "/images/roadtrip-zuid.svg",
      alt: "Roadtrip door het zuiden"
    },
    {
      id: 3,
      title: "Verborgen Parels aan zee",
      image: "/images/zee-parels.svg",
      alt: "Verborgen Parels"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // TODO: Implement search functionality
  };

  const handlePlanTrip = () => {
    console.log("Planning trip...");
    // TODO: Implement trip planning logic
  };

  const handleReadGuides = () => {
    console.log("Reading guides...");
    // TODO: Implement guide reading functionality
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f6f1" }}>
      {/* Hero Section */}
      <header 
        className="relative bg-cover bg-center text-white py-24 px-5 text-center"
        style={{
          backgroundImage: "url('/images/header.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-3 font-inter">Ontdek Polen</h1>
          <p className="text-xl mb-8 font-inter">Mooie plekken in Polen ontdekken</p>
          
          <form onSubmit={handleSearch} className="mt-5 mb-5">
            <div className="relative inline-block">
              <Input
                type="text"
                placeholder="Zoek bestemming"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 px-5 w-80 max-w-full border-none rounded-lg text-base text-gray-900 font-inter"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            </div>
          </form>
          
          <Button
            onClick={handlePlanTrip}
            className="mt-2 py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
            style={{ backgroundColor: "#2f3e46" }}
          >
            Plan je reis
          </Button>
        </div>
      </header>

      {/* Destination Grid */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {destinations.map((destination) => (
            <Card 
              key={destination.id} 
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none"
            >
              <img
                src={destination.image}
                alt={destination.alt}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 font-bold font-inter text-gray-900">
                {destination.name}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-8 items-center justify-between">
          <div className="flex-1 min-w-80">
            <h2 className="text-3xl font-bold mb-4 font-inter text-gray-900">
              Laat je verrassen door het onbekende Polen
            </h2>
            <p className="text-lg mb-6 font-inter text-gray-700">
              Bezoek historische steden, ontdek natuurparken en verborgen parels. 
              Onze reisgidsen helpen je op weg!
            </p>
            <Button
              onClick={handleReadGuides}
              className="py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: "#2f3e46" }}
            >
              Lees onze gidsen
            </Button>
          </div>
          <div className="flex-1 min-w-80">
            <img
              src="/images/tatra-vallei.svg"
              alt="Tatra Valley"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Travel Guides */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
          Reisgidsen en Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {travelGuides.map((guide) => (
            <Card 
              key={guide.id} 
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none"
            >
              <img
                src={guide.image}
                alt={guide.alt}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 font-bold font-inter text-gray-900">
                {guide.title}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="text-center py-10 px-5 text-white"
        style={{ backgroundColor: "#2f3e46" }}
      >
        <p className="font-inter">
          &copy; 2025 Ontdek Polen. Alle rechten voorbehouden.
        </p>
      </footer>
    </div>
  );
}
