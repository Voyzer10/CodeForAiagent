import { useRouter } from "next/router";

export default function GmailConnected() {
  const router = useRouter();
  const { success } = router.query;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="bg-[#0e1513] p-10 rounded-xl border border-green-700 shadow-lg text-center max-w-md w-full">

        {success === "1" ? (
          <>
            <h1 className="text-2xl font-bold text-green-400 mb-4">
              Gmail Connected Successfully! 🎉
            </h1>
            <p className="text-gray-300 mb-6">
              Your Gmail account is now connected and ready to use.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Gmail Connection Failed ❌
            </h1>
            <p className="text-gray-300 mb-6">
              Something went wrong. Please try again.
            </p>
          </>
        )}

        <a
          href="/pages/profile"
          className="bg-green-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-green-400"
        >
          Go Back to Profile
        </a>
      </div>
    </div>
  );
}
