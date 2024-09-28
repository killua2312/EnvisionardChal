const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.POSTGRE_DB,
  process.env.POSTGRE_USER,
  process.env.POSTGRE_PASS,
  {
    host: "localhost",
    dialect: "postgres",
    port: parseInt(process.env.POSTGRE_PORT) || 5432,
  }
);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") != 0 && file != basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
