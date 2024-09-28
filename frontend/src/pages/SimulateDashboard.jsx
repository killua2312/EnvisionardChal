import { useSurgePricing } from "../contexts/SurgePricingContext";
import CurrentDeliveryFee from "../components/CurrentDeliveryFee";
import SimulationControls from "../components/SimulationControls";

const SimulateDashboard = () => {
  const { simulateSurgePricing, simulatePricingData } = useSurgePricing();

  const handleSimulate = async (simulationData) => {
    await simulateSurgePricing(simulationData);
  };

  return (
    <div className="simulate-dashboard">
      <h2>Simulate Dashboard</h2>
      {simulatePricingData && (
        <CurrentDeliveryFee
          totalFee={simulatePricingData.total_fee}
          surgeMultiplier={simulatePricingData.surge_multiplier}
        />
      )}
      <SimulationControls onSimulate={handleSimulate} />
    </div>
  );
};

export default SimulateDashboard;
