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
  return db.createTable('enrollments', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    user_id: { type: 'int', notNull: true, foreignKey: { name: 'enrollments_user_fk', table: 'users', mapping: 'id', rules: { onDelete: 'CASCADE' } } },
    course_id: { type: 'int', notNull: true, foreignKey: { name: 'enrollments_course_fk', table: 'courses', mapping: 'id', rules: { onDelete: 'CASCADE' } } },
    enrolled_at: { type: 'timestamp', notNull: true, defaultValue: String('CURRENT_TIMESTAMP') }
  });
};

exports.down = function(db: any): Promise<any> {
  return db.dropTable('enrollments');
};

exports._meta = {
  "version": 1
};

