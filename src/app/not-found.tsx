import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
            <p className="text-sm font-semibold text-brand-600">404</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
                The page you are looking for does not exist.
            </p>
            <Link
                href="/"
                className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
                Back to workspace
            </Link>
        </div>
    );
}
