/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.addColumn('transactions', {
    category_id: {
      type: 'uuid',
      notNull: false,
      references: '"categories"',
    },
  });

  pgm.sql(`
    UPDATE transactions t
    SET category_id = c.id
    FROM categories c
    WHERE c.user_id = t.user_id
      AND lower(c.name) = lower(t.category)
      AND t.category_id IS NULL;
  `);

  pgm.sql(`
    UPDATE transactions t
    SET category_id = c.id
    FROM categories c
    WHERE c.user_id = t.user_id
      AND lower(c.name) = 'other'
      AND t.category_id IS NULL;
  `);

  pgm.alterColumn('transactions', 'category_id', { notNull: true });

  pgm.createIndex('transactions', 'category_id');

  pgm.dropColumn('transactions', 'category');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.addColumn('transactions', {
    category: {
      type: 'varchar(255)',
      notNull: false,
    },
  });

  pgm.sql(`
    UPDATE transactions t
    SET category = c.name
    FROM categories c
    WHERE t.category_id = c.id;
  `);

  pgm.dropColumn('transactions', 'category_id');
};
