import { Skeleton } from '@/components/ui/Spinner';

/** Structured loading placeholder that mirrors the result layout. */
export function ResultsSkeleton() {
    return (
        <div className="space-y-5" aria-hidden="true">
            <div className="space-y-2">
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-10/12" />
                <Skeleton className="h-3 w-9/12" />
            </div>
        </div>
    );
}
