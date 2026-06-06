import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE, SITE_URL } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: SITE.name,
  description:
    "Ushqime tradicionale shqiptare të punuara me dorë — mantia, byrek, fli, sarma. Porosi online me dërgesa falas në Prishtinë.",
  servesCuisine: ["Albanian", "Traditional", "Tradicionale shqiptare"],
  priceRange: "€€",
  telephone: SITE.phoneIntl,
  url: SITE_URL,
  hasMenu: `${SITE_URL}/menu`,
  acceptsReservations: false,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.street,
    addressLocality: SITE.city,
    postalCode: SITE.postalCode,
    addressCountry: SITE.country,
  },
  areaServed: { "@type": "City", name: SITE.city },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    ],
    opens: "09:00",
    closes: "18:00",
  },
  potentialAction: {
    "@type": "OrderAction",
    target: `${SITE_URL}/menu`,
    deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
