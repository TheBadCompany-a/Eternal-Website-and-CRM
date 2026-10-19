import { useAuth } from '../../../auth/useAuth';
import { useFleet } from '../../../data/useFleet';
import { useState } from 'react';
import { AddVehicleModal } from '../AddVehicleModal';
import { StatusBadge } from '../StatusBadge';

export function VehiclesScreen() {
  const fleet = useFleet();
  const { profile } = useAuth();
  const canAdd = profile?.app_role === 'admin' || profile?.app_role === 'coordinator';
  const [adding, setAdding] = useState(false);
  const vehicles = fleet.data ?? [];

  return (
    <div className="crm-screen active">
      <div className="crm-section-card">
        <div className="crm-card-header">
          <h3>Fleet & Hearse Inventory ({vehicles.length} Total Vehicles)</h3>
          {canAdd && (
            <button className="btn btn-sm btn-primary" onClick={() => setAdding(true)}>
              + Add Vehicle
            </button>
          )}
        </div>
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Model & Tier</th>
                <th>Registration</th>
                <th>Current Status</th>
                <th>Assigned Case</th>
                <th>Driver</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 && (
                <tr><td colSpan={7}>{fleet.isLoading ? 'Loading fleet…' : 'No vehicles yet.'}</td></tr>
              )}
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.code}</strong>
                  </td>
                  <td>
                    <strong>{v.model}</strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace' }}>{v.reg}</span>
                  </td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                  <td>{v.assignedCase}</td>
                  <td>{v.driver}</td>
                  <td>📍 {v.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddVehicleModal isOpen={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
