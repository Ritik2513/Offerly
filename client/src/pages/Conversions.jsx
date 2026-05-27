import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "sonner";
import ConversionTable from "../components/conversions/ConversionTable";
import { CheckCircle2, Clock3, XCircle, IndianRupee } from "lucide-react";

const Conversions = () => {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversions = async () => {
      try {
        const { data } = await API.get("/conversions");

        setConversions(data.conversions || []);
      } catch (error) {
        toast.error("Failed to fetch conversions");
      } finally {
        setLoading(false);
      }
    };

    fetchConversions();
  }, []);

  // STATS
  const approved = conversions.filter(
    (item) => item.status === "approved",
  ).length;

  const pending = conversions.filter(
    (item) => item.status === "pending",
  ).length;

  const rejected = conversions.filter(
    (item) => item.status === "rejected",
  ).length;

  const totalRevenue = conversions
    .filter((item) => item.status === "approved")
    .reduce((acc, item) => acc + Number(item.payout || 0), 0);

  return (
    <div className="space-y-6 font-inter">
      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-2xl font-bold tracking-tight text-[#071437]">
            Conversions
          </h1>

          <p className="text-[#5E6278] mt-2 text-sm">
            Review, manage, and monitor affiliate conversion activity.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Approved */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>

              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {approved}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>

              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {pending}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <Clock3 size={22} className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>

              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {rejected}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
              <XCircle size={22} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>

              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                ₹{totalRevenue}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <IndianRupee size={22} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="p-0">
        <ConversionTable conversions={conversions} loading={loading} />
      </div>
    </div>
  );
};

export default Conversions;
