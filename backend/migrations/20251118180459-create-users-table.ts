let dbm: any;
let type: any;
let seed: any;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options: any, seedLink: any): void {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db: any): Promise<any> {
  return db.createTable('users', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    email: { type: 'string', length: 255, notNull: true, unique: true },
    password: { type: 'string', length: 255, notNull: true },
    name: { type: 'string', length: 255, notNull: true },
    role: { type: 'string', length: 50, notNull: true, defaultValue: 'student' },
    created_at: { type: 'timestamp', notNull: true, defaultValue: String('CURRENT_TIMESTAMP') }
  });
};

exports.down = function(db: any): Promise<any> {
  return db.dropTable('users');
};

exports._meta = {
  "version": 1
};

