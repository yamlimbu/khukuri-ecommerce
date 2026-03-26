'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { XCircle, CheckCircle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyAccountAction } from './actions';

type VerifyResultType = { success?: boolean; error?: string };

export function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [result, setResult] = useState<VerifyResultType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setResult({ error: 'Missing token' });
            setLoading(false);
            return;
        }

        const verify = async () => {
            const res = await verifyAccountAction(token);

            if (res.success) {
                setResult({ success: true });
                setLoading(false);

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/sign-in');
                }, 2000);
            } else {
                setResult(res);
                setLoading(false);
            }
        };

        verify();
    }, [token, router]);

    // Case: token missing in URL
    if (!token) {
        return (
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-center">
                        <XCircle className="h-16 w-16 text-destructive" />
                    </div>
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-bold">Invalid Verification Link</h1>
                        <p className="text-muted-foreground">
                            The verification link is invalid or missing a token.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link href="/register" className="block">
                            <Button variant="outline" className="w-full">
                                Create New Account
                            </Button>
                        </Link>
                        <Link href="/sign-in" className="block">
                            <Button variant="ghost" className="w-full">
                                Back to Sign In
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Case: still loading verification
    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6 space-y-4 text-center">
                    <p>Verifying your email, please wait...</p>
                </CardContent>
            </Card>
        );
    }

    // Case: verification failed
    if (result?.error) {
        return (
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-center">
                        <XCircle className="h-16 w-16 text-destructive" />
                    </div>
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-bold">Verification Failed</h1>
                        <p className="text-muted-foreground">{result.error}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link href="/register" className="block">
                            <Button variant="outline" className="w-full">
                                Create New Account
                            </Button>
                        </Link>
                        <Link href="/sign-in" className="block">
                            <Button variant="ghost" className="w-full">
                                Back to Sign In
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Case: verification succeeded
    return (
        <Card>
            <CardContent className="pt-6 space-y-4 text-center">
                <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Email Verified!</h1>
                    <p className="text-muted-foreground">
                        Your email has been verified. Redirecting to login...
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}