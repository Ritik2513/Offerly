import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "sonner";
import PayoutStats from "../components/payouts/PayoutStats";
import PayoutTable from "../components/payouts/PayoutTable";
import Header from "../components/ui/Header";
import TableToolbar from "../components/table/TableToolbar";
import TablePagination from "../components/table/TablePagination";

const Payouts = () => {
  const [payouts, setPayout] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/payouts", {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          status,
        },
      });
      setPayout(data.data || []);
      setAnalytics(data.analytics || {});
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchPayouts();
  }, [page, debouncedSearch, status]);

  const handleMarkPaid = async (id) => {
    try {
      const { data } = await API.patch(`/payouts/${id}/pay`);
      fetchPayouts();

      toast.success(data.message);

      fetchPayouts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update payout");
    }
  };

  return (
    <>
      <div className="space-y-6 font-inter">
        {/* PAGE HEADER */}
        <Header
          title="Payouts"
          description="Pending balances and payment history."
        />

        {/* STATS */}
        <PayoutStats analytics={analytics} />

        <TableToolbar
          search={search}
          setSearch={(value) => {
            setPage(1);
            setSearch(value);
          }}
          status={status}
          setStatus={(value) => {
            setPage(1);
            setStatus(value);
          }}
          placeholder="Search Payouts..."
          statusOptions={[
            { value: "paid", label: "Paid" },
            { value: "pending", label: "Pending" },
          ]}
        />

        {/* TABLE */}
        <PayoutTable
          payouts={payouts}
          loading={loading}
          onMarkPaid={handleMarkPaid}
        />

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};

export default Payouts;
