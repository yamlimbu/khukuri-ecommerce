import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Banner() {
    return (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-sm font-medium relative z-50">
            <div className="container mx-auto flex items-center justify-center gap-2">
                <span>Free shipping on all orders over $100!</span>
                <Link href="/search" className="inline-flex items-center gap-1 hover:underline underline-offset-4 decoration-emerald-200 text-emerald-50">
                    Shop now <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
