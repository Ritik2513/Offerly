import { useEffect, useState } from "react";
import API from "../api/axios";
import OfferTable from "../components/offers/OfferTable";
import { toast } from "sonner";
import Modal from "../components/ui/Modal";
import CreateOfferForm from "../components/offers/CreateOfferForm";
import EditOfferForm from "../components/offers/EditOfferForm";
import DeleteOfferModal from "../components/offers/DeleteOfferModal";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false); //create modal
  const [editModal, setEditModal] = useState(false); //edit modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null); //selected Offer
  const [deleteOffer, setDeleteOffer] = useState(null);

  // Fetch Offer from DB
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await API.get("/offers");
        setOffers(data || []);
      } catch (error) {
        toast.error(error.message);
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 font-inter">
        <div>
          <h1 className="text-[32px] sm:text-[24px] leading-tight font-semibold tracking-tight text-[#071437]">
            Offers
          </h1>
          <p className="text-[#5E6278] mt-1 text-sm sm:text-sm">
            Manage campaigns available to your affiliate network.
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition cursor-pointer"
        >
          Create Offer
        </button>
      </div>
      <OfferTable
        offers={offers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Create New Offer"
      >
        <CreateOfferForm
          onSuccess={(newOffer) => {
            setOffers((prev) => [newOffer, ...(prev || [])]);
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
              setOffers((prev) =>
                prev.map((item) =>
                  item._id === updatedOffer._id ? updatedOffer : item,
                ),
              );

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
              setOffers((prev) => prev.filter((item) => item._id !== id));

              setDeleteModal(false);
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default Offers;
