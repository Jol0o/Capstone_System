'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MoveLeft, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation';
export default function NotFound() {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-screen px-4 ">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <AlertCircle className="w-12 h-12 text-yellow-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-center">404 - Page Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-center text-gray-600">
                        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="flex justify-center">
                        <div className="relative w-64 h-64">
                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                            <div className="absolute delay-75 bg-blue-500 rounded-full inset-4 animate-ping opacity-40"></div>
                            <div className="absolute delay-150 bg-blue-500 rounded-full inset-8 animate-ping opacity-60"></div>
                            <div className="absolute delay-300 bg-blue-500 rounded-full inset-12 animate-ping opacity-80"></div>
                            <div className="absolute bg-blue-500 rounded-full inset-16"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-5xl font-bold text-white">404</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="default" onClick={() => router.push('/dashboard')} className="z-50 flex items-center">
                        <MoveLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}