"use client";

export default function AppVersion() {
    const version = process.env.NEXT_PUBLIC_RELEASE_VERSION ?? "local";
    const commit = process.env.NEXT_PUBLIC_RELEASE_COMMIT ?? "unknown";
    const date = process.env.NEXT_PUBLIC_RELEASE_DATE ?? "";

    return (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500" title={date ? `Build time (UTC): ${date}` : undefined}>
            <span>Version {version}</span>
            <span aria-hidden="true">·</span>
            <span>Build {commit}</span>
        </div>
    );
}
