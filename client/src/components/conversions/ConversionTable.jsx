import ConversionStatusBadge from "./ConversionStatusBadge";
import { DollarSign, CalendarDays } from "lucide-react";

const ConversionTable = ({ conversions, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">
        <p className="text-gray-500 text-sm">Loading conversions...</p>
      </div>
    );
  }

  if (!conversions?.length) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">
          No conversions found
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          Conversion records will appear here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        bg-white rounded-2xl
        border border-gray-200
        overflow-hidden
        shadow-sm
        font-inter
      "
    >
      {/* DESKTOP TABLE */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">
                Affiliate
              </th>

              <th className="text-left px-6 py-4 font-semibold text-gray-600">
                Offer
              </th>

              <th className="text-left px-6 py-4 font-semibold text-gray-600">
                Payout
              </th>

              <th className="text-left px-6 py-4 font-semibold text-gray-600">
                Status
              </th>

              <th className="text-left px-6 py-4 font-semibold text-gray-600">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {conversions.map((conversion) => (
              <tr
                key={conversion._id}
                className="
                  border-b border-gray-100
                  hover:bg-gray-50
                  transition
                "
              >
                {/* AFFILIATE */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        w-11 h-11 rounded-2xl
                        bg-blue-100
                        flex items-center justify-center
                        text-sm font-bold text-blue-700
                      "
                    >
                      {conversion?.affiliate?.name?.charAt(0)}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {conversion?.affiliate?.name}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {conversion?.affiliate?.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* OFFER */}
                <td className="px-6 py-5">
                  <div>
                    <p className="font-medium text-gray-900">
                      {conversion?.offer?.title}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Affiliate Campaign
                    </p>
                  </div>
                </td>

                {/* REVENUE */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <DollarSign size={16} className="text-green-600" />
                    {conversion.payout}
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-6 py-5">
                  <ConversionStatusBadge status={conversion.status} />
                </td>

                {/* DATE */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarDays size={15} />

                    <span>
                      {new Date(
                        conversion.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden divide-y divide-gray-100">
        {conversions.map((conversion) => (
          <div
            key={conversion._id}
            className="p-5 hover:bg-gray-50 transition"
          >
            {/* TOP */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-12 h-12 rounded-2xl
                    bg-blue-100
                    flex items-center justify-center
                    text-sm font-bold text-blue-700
                  "
                >
                  {conversion?.affiliate?.name?.charAt(0)}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {conversion?.affiliate?.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    {conversion?.affiliate?.email}
                  </p>
                </div>
              </div>

              <ConversionStatusBadge status={conversion.status} />
            </div>

            {/* OFFER */}
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Offer
              </p>

              <p className="font-medium text-gray-900">
                {conversion?.offer?.title}
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              {/* REVENUE */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                  Revenue
                </p>

                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-green-600" />

                  <p className="font-semibold text-gray-900">
                    {conversion.payout}
                  </p>
                </div>
              </div>

              {/* DATE */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                  Date
                </p>

                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarDays size={15} />

                  <p className="text-sm font-medium">
                    {new Date(
                      conversion.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionTable;