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
  return db.createTable('courses', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: { type: 'string', length: 255, notNull: true },
    description: { type: 'text' },
    instructor_id: { type: 'int', notNull: true, foreignKey: { name: 'courses_instructor_fk', table: 'users', mapping: 'id', rules: { onDelete: 'CASCADE' } } },
    price: { type: 'decimal', precision: 10, scale: 2, notNull: true },
    image_url: { type: 'string', length: 500 },
    status: { type: 'string', length: 50, notNull: true, defaultValue: 'draft' },
    created_at: { type: 'timestamp', notNull: true, defaultValue: String('CURRENT_TIMESTAMP') }
  });
};

exports.down = function(db: any): Promise<any> {
  return db.dropTable('courses');
};

exports._meta = {
  "version": 1
};

