import { Ellipsis } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card';

const LoadingPost = () => {
    return (
        <div className="w-full max-w-3xl my-4 animate-pulse">
            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full" />
                            <div className="flex flex-col gap-1">
                                <div className="w-24 h-4 bg-gray-300 rounded" />
                                <div className="w-16 h-3 bg-gray-200 rounded" />
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" disabled>
                            <Ellipsis />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-2">
                    <div className="w-3/4 h-5 bg-gray-300 rounded" />
                    <div className="w-full h-4 bg-gray-200 rounded" />
                    <div className="w-full h-32 bg-gray-200 rounded" />
                </CardContent>

                <CardFooter className="flex justify-between gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoadingPost;