"use client";

import {useSearchParams} from 'next/navigation';
import {Card, CardContent} from '@/components/ui/card';
import {Loader2} from 'lucide-react';
import {VerifyContent} from './verify-content';

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const tokenParam = searchParams?.get('token');
    const token = tokenParam ?? null;

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-center">
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold">Verifying Your Account</h1>
                            <p className="text-muted-foreground">
                                Please wait while we verify your email address...
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <VerifyContent token={token} />
            </div>
        </div>
    );
}
