import {Button} from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative bg-zinc-950 overflow-hidden border-b border-zinc-800">
            {/* Background Pattern/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black opacity-90" />
            
            <div className="relative text-zinc-100 container mx-auto px-4 py-32 md:py-48 flex flex-col items-center justify-center text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-4 text-emerald-500 drop-shadow-md uppercase">
                        Genuine Gurkha Kukri Knives
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto">
                        Hand forged in Nepal by traditional Kamis since 1991. Official Army Kukri maker and exporter.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                        <Button asChild size="lg" className="min-w-[220px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg border-2 border-emerald-700 shadow-lg">
                            <Link href="/search">
                                Shop Traditional Knives
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="min-w-[220px] border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white font-semibold">
                            <Link href="/search?q=modern">
                                View Modern Selection
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
