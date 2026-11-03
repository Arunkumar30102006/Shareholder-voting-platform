import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
const VotingCardSkeleton = () => {
    return (<Card className="border-border/50 shadow-soft bg-card/40">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 w-full">
                        {/* Index/Icon Skeleton */}
                        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0"/>

                        <div className="w-full space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                {/* Badge Skeleton */}
                                <Skeleton className="h-5 w-20 rounded-full"/>
                            </div>
                            {/* Title Skeleton */}
                            <Skeleton className="h-6 w-3/4 rounded-md"/>
                            {/* Description Skeleton */}
                            <Skeleton className="h-4 w-full rounded-md"/>
                            <Skeleton className="h-4 w-2/3 rounded-md"/>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
                    {/* Button Skeletons */}
                    <Skeleton className="h-10 flex-1 rounded-md"/>
                    <Skeleton className="h-10 flex-1 rounded-md"/>
                    <Skeleton className="h-10 flex-1 rounded-md"/>
                </div>
            </CardContent>
        </Card>);
};
export default VotingCardSkeleton;
