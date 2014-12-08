var expect = require('expect');
var redis = require('../index');
var db = require('./db');

describe('select', function () {
  afterEach(function () {
    return db.select(0);
  });

  it('selects the appropriate database', function () {
    return db.select(3).then(function (){
      expect(db.selected_db).toEqual(3);
    });
  });
});
