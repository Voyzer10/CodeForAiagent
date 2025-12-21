import JobFoundClient from "./JobFoundClient";

// 🛡️ Prevent static generation crash by forcing dynamic rendering
export const dynamic = "force-dynamic";

export default function Page() {
    return <JobFoundClient />;
}
