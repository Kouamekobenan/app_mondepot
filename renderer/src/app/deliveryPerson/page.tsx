"use client";
import React, { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import { LiveryPerson } from "../components/liveryPerson/LiveryPerson";
import { FormLivModal } from "../components/liveryPerson/FormLiv";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    // Tu peux déclencher un refetch ici via un état global, un context ou props vers <Fournisseur />
    handleCloseModal();
  };

  return (
    <div className="flex">
      <div className="card">
        <Navbar />
      </div>
      <div className="content flex-1/2">
        <FormLivModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode="create"
          onSuccess={handleSuccess}
        />
        <LiveryPerson onClick={handleOpenModal} />
      </div>
    </div>
  );
}
