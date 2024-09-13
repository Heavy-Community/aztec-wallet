import React from "react";
import { useSchnorr } from "../hooks/useSchnorr";
import { useEcdsa } from "../hooks/useEcdsa";
import "./Accounts.css"; // Include custom styles for this page

const CreateAndDeploySchnorrAccount: React.FC = () => {
  const { createSchnorrAccount, wait, addresses } = useSchnorr(); // Get the list of addresses
  const { createEcdsaAccount, wait_ecdsa, ecdsa_addresses } = useEcdsa(); // Get the list of addresses

  return (
    <div className="account-container">
      <h1 className="account-header">Create New Account</h1>
      <div className="account-section">
        <form onSubmit={createSchnorrAccount} className="account-form">
          <button type="submit" disabled={wait} className="action-button">
            {wait ? "Creating Schnorr Account..." : "Create Schnorr Account"}
          </button>
        </form>
        <form onSubmit={createEcdsaAccount} className="account-form">
          <button type="submit" disabled={wait_ecdsa} className="action-button">
            {wait_ecdsa ? "Creating ECDSA Account..." : "Create ECDSA Account"}
          </button>
        </form>
      </div>

      <div className="address-section">
        <h3 className="address-header">Generated Schnorr Addresses</h3>
        {addresses.length > 0 ? (
          <table className="address-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Account Address</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((address, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-addresses">No addresses generated yet.</p>
        )}

        <h3 className="address-header">Generated ECDSA Addresses</h3>
        {ecdsa_addresses.length > 0 ? (
          <table className="address-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Account Address</th>
              </tr>
            </thead>
            <tbody>
              {ecdsa_addresses.map((address, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-addresses">No addresses generated yet.</p>
        )}
      </div>
    </div>
  );
};

export default CreateAndDeploySchnorrAccount;
