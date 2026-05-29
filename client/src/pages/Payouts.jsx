import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "sonner";
import PayoutStats from "../components/payouts/PayoutStats";
import PayoutTable from "../components/payouts/PayoutTable";

const Payouts = () => {
  const [payouts, setPayout] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const { data } = await API.get("/payouts");
        setPayout(data.payouts || []);
        setAnalytics(data.analytics || {});
      } catch (error) {
        toast.error("Failed to fetch payouts");
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  return (
    <>
      <div className="space-y-6 font-inter">
        {/* PAGE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-2xl font-bold tracking-tight text-[#071437]">
              Payouts
            </h1>

            <p className="text-[#5E6278] mt-2 text-sm">
              Pending balances and payment history.
            </p>
          </div>
        </div>

        {/* STATS */}
        <PayoutStats analytics={analytics} />

        {/* TABLE */}
        <PayoutTable payouts={payouts} loading={loading} />
      </div>
    </>
  );
};

export default Payouts;
