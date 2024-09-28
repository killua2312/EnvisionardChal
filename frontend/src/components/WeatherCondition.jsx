const WeatherCondition = ({ weatherCondition }) => {
  return (
    <div className="weathe-condition">
      <h3>Weather Condition</h3>
      <p>{weatherCondition}</p>
    </div>
  );
};

export default WeatherCondition;
