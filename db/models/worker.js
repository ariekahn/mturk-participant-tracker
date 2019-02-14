'use strict';
module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define('Worker', {
    workerid: DataTypes.STRING,
    hitid: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  Worker.associate = function(models) {
    // associations can be defined here
  };
  return Worker;
};