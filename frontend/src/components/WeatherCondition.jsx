const WeatherCondition = ({ weatherCondition }) => {
  return (
    <div className="card">
      <h3>Weather Condition</h3>
      <p>{weatherCondition}</p>
    </div>
  );
};

export default WeatherCondition;
