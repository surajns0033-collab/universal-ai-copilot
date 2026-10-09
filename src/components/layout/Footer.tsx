export function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6">
                <p>
                    Open-source · Apache-2.0 · Built for the MLH Hacktoberfest Hack Day (Navi Mumbai)
                </p>
                <p>AI output can be inaccurate. Verify important information against the source.</p>
            </div>
        </footer>
    );
}
