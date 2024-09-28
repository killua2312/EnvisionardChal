const CurrentDeliveryFee = ({ totalFee, surgeMultiplier }) => {
  return (
    <div className="current-delivery-fee">
      <h3>Current Delivery Fee</h3>
      <p>Total Fee: ₹{totalFee}</p>
      <p>Surge Multiplier: {surgeMultiplier}x</p>
    </div>
  );
};

export default CurrentDeliveryFee;
