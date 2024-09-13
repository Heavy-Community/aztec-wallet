import React, { useState } from "react";
import { CreateTransaction } from "../hooks/useTransactions";
import Modal from "./modal"; // Import the new Modal component
import "./Transactions.css"; // Include custom styles here

const Transactions: React.FC = () => {
  const {
    sendTransaction,
    amount,
    sender,
    recipient,
    description,
    wait,
    setAmount,
    setRecipient,
    transactionStatus,
    setSender,
    setDescription,
  } = CreateTransaction();

  const [showModal, setShowModal] = useState(false); // Modal visibility state

  // Function to handle closing the modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Open modal when transaction is successful
  React.useEffect(() => {
    if (transactionStatus && transactionStatus.includes("successful")) {
      setShowModal(true); // Show modal on success
    }
  }, [transactionStatus]);

  return (
    <div className="transaction-container">
      <h1 className="transaction-header">Send Aztec tokens</h1>
      <form onSubmit={sendTransaction} className="transaction-form">
        <div className="form-group">
          <label className="form-label">Sender</label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Enter sender address"
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Recipient</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient address"
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Transaction Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            className="form-input"
            required
          />
        </div>
        <div className="button-group">
          <button type="button" className="cancel-button" disabled={wait}>
            Cancel
          </button>
          <button type="submit" className="continue-button" disabled={wait}>
            {wait ? "Processing..." : "Send"}
          </button>
        </div>
      </form>

      {/* Modal for showing success transaction */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title="Transaction Successful"
        body={`Transaction was successful from ${sender} to ${recipient}.`}
      />
    </div>
  );
};

export default Transactions;
