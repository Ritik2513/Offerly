import { ChevronLeft, ChevronRight } from "lucide-react";

const TablePagination = ({ page, totalPages, totalItems, onPageChange }) => {
  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Records */}
        <div className="text-sm text-gray-500">
          Showing page{" "}
          <span className="font-semibold text-gray-800">{page}</span> of{" "}
          <span className="font-semibold text-gray-800">{totalPages || 1}</span>
          {" • "}
          <span className="font-semibold text-gray-800">{totalItems}</span>{" "}
          records
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              border border-gray-200
              bg-white
              text-sm font-medium
              hover:bg-gray-50
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition
            "
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <div
            className="
              min-w-15
              text-center
              px-4 py-2
              rounded-xl
              bg-indigo-50
              text-indigo-700
              font-semibold
              text-sm
            "
          >
            {page}
          </div>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => onPageChange(page + 1)}
            className="
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              border border-gray-200
              bg-white
              text-sm font-medium
              hover:bg-gray-50
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition
            "
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
