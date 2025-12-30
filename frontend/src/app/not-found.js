import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a110a] text-white p-4">
            <div className="text-center space-y-6">
                <h1 className="text-6xl font-black text-[#00FA92]">404</h1>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold uppercase tracking-widest italic">Protocol Interrupted</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        The requested neural node could not be located in the current infrastructure.
                    </p>
                </div>
                <Link
                    href="/"
                    className="inline-block px-8 py-3 bg-[#00FA92] text-black font-black uppercase tracking-tighter rounded-xl hover:bg-[#00d67d] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,250,146,0.3)]"
                >
                    Return to Hub
                </Link>
            </div>
        </div>
    );
}
