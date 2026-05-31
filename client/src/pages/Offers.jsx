import { useEffect, useState } from "react";
import API from "../api/axios";
import OfferTable from "../components/offers/OfferTable";
import { toast } from "sonner";
import Modal from "../components/ui/Modal";
import CreateOfferForm from "../components/offers/CreateOfferForm";
import EditOfferForm from "../components/offers/EditOfferForm";
import DeleteOfferModal from "../components/offers/DeleteOfferModal";
import TableToolbar from "../components/table/TableToolbar";
import TablePagination from "../components/table/TablePagination";
import Header from "../components/ui/Header";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalOffers: 0,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false); //create modal
  const [editModal, setEditModal] = useState(false); //edit modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null); //selected Offer
  const [deleteOffer, setDeleteOffer] = useState(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/offers", {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          status,
        },
      });
      setOffers(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  //search after user type whole word
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Offer from DB
  useEffect(() => {
    fetchOffers();
  }, [page, debouncedSearch, status]);

  // Open Edit Modal
  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setEditModal(true);
  };

  // Open Delete Modal
  const handleDelete = (offer) => {
    setDeleteOffer(offer);
    setDeleteModal(true);
  };

  return (
    <>
      <Header
        title="Offers"
        description="Manage campaigns available to your Offer."
        buttonText="Create Offer"
        onButtonClick={() => setOpenModal(true)}
      />

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
        placeholder="Search Offers..."
        statusOptions={[
          { value: "active", label: "Active" },
          { value: "paused", label: "paused" },
        ]}
      />

      <OfferTable
        offers={offers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TablePagination
        page={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalOffers}
        onPageChange={setPage}
      />

      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Create New Offer"
      >
        <CreateOfferForm
          onSuccess={(newOffer) => {
            fetchOffers();
            setOpenModal(false);
          }}
        />
      </Modal>

      {/* EDIT Modal */}
      {selectedOffer && (
        <Modal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          title="Edit Offer"
        >
          <EditOfferForm
            offer={selectedOffer}
            onSuccess={(updatedOffer) => {
              fetchOffers();

              setEditModal(false);
            }}
          />
        </Modal>
      )}

      {deleteOffer && (
        <Modal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          title="Delete Offer"
        >
          <DeleteOfferModal
            offer={deleteOffer}
            onClose={() => setDeleteModal(false)}
            onSuccess={(id) => {
              fetchOffers();

              setDeleteModal(false);
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default Offers;
