'use strict'

var dbm
var type
var seed

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = function(db, callback) {
  db.createTable('messages', {
    id: { type: 'int', primaryKey: true, autoIncrement: true},
    type: 'string',
    body: 'string',
    image_url: 'string',
    image_preview: 'string',
    sender_id: 'int',
    sender_name: 'string',
    timestamp: 'int'
  }, callback)
}

exports.down = function(db, callback) {
  db.dropTable('messages', callback)
}

exports._meta = {
  "version": 1
}
