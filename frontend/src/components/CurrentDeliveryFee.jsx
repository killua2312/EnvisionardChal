const CurrentDeliveryFee = ({ totalFee, surgeMultiplier }) => {
  return (
    <div className="card">
      <h3>Current Delivery Fee</h3>
      <p className="price">Total Fee: ₹{totalFee}</p>
      <p className="multiplier">Surge Multiplier: {surgeMultiplier}x</p>
    </div>
  );
};

export default CurrentDeliveryFee;
