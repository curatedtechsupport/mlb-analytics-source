import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-5xl font-bold text-muted-foreground/30 mb-4" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>404</div>
      <h1 className="text-lg font-bold text-foreground mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6">This page doesn't exist or was moved.</p>
      <Link href="/">
        <a className="text-primary hover:underline text-sm">Back to Today's Slate</a>
      </Link>
    </div>
  );
}
