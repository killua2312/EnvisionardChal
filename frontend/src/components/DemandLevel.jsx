const DemandLevel = ({ demandLevel }) => {
  return (
    <div className="card">
      <h3>Demand Level</h3>
      <div className="demand-levels">
        <div
          className={`demand-level ${demandLevel
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          {demandLevel}
        </div>
      </div>
    </div>
  );
};

export default DemandLevel;
