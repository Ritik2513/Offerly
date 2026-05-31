import React from "react";

const Header = ({ title, description, buttonText, onButtonClick }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-inter">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-2xl font-bold tracking-tight text-[#071437]">
            {title}
          </h1>

          <p className="text-sm text-[#5E6278] mt-2">{description}</p>
        </div>

        {buttonText && (
          <button
            onClick={onButtonClick}
            className="
            bg-blue-600 hover:bg-blue-700
            text-white px-5 py-3
            rounded-xl font-medium
            transition cursor-pointer
          "
          >
            {buttonText}
          </button>
        )}
      </div>
    </>
  );
};

export default Header;
