import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "sonner";
import AffiliateTable from "../components/affiliates/AffiliateTable";
import Modal from "../components/ui/Modal";
import AffiliateForm from "../components/affiliates/AffiliateForm";
import TableToolbar from "../components/table/TableToolbar";
import TablePagination from "../components/table/TablePagination";

const Affiliates = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalAffiliates: 0,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAffiliates();
  }, [page, debouncedSearch, status]);

  const fetchAffiliates = async () => {
    try {
      const { data } = await API.get("/users", {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          status,
        },
      });

      setAffiliates(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch affiliates");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (affiliate) => {
    try {
      const { data } = await API.patch(`/users/${affiliate._id}/status`);

      setAffiliates((prev) =>
        prev.map((item) => (item._id === affiliate._id ? data.user : item)),
      );

      toast.success(
        affiliate.isActive ? "Affiliate disabled" : "Affiliate enabled",
      );
    } catch (error) {
      toast.error("Failed to update affiliate");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-2xl font-bold tracking-tight text-[#071437]">
            Affiliate Management
          </h1>

          <p className="text-sm text-[#5E6278] mt-2">
            Manage affiliate access and account status.
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition cursor-pointer"
        >
          Create Affiliate
        </button>
      </div>

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
        placeholder="Search Affiliates"
        statusOptions={[
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
        ]}
      />

      {/* TABLE */}
      <AffiliateTable
        affiliates={affiliates}
        loading={loading}
        onToggleStatus={handleToggleStatus}
      />

      <TablePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalAffiliates}
        onPageChange={setPage}
      />

      {/* MODAL */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Create Affiliate"
      >
        <AffiliateForm
          onSuccess={(user) => {
            setAffiliates((prev) => [user, ...prev]);

            setOpenModal(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Affiliates;
