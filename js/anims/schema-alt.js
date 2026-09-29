/* Still diagram (schema, alternative notation): PK and FK badges and crow's-foot ends, an Enterprise Computing extension.
   NESA says other schema notations are acceptable (p.16); the NESA style is spec-schema-games.
   Enterprise Computing › Data science (relational databases and schemas). */
HSCAnim.define('schema-alt', {
  still: true,
  title: 'Schema: customers and orders, with PK and FK badges and crow’s-foot ends',
  alt: 'Schema with two tables. Customers has CustomerID (primary key), Name and Email. Orders has OrderID (primary key), CustomerID (foreign key), OrderDate and Total. One customer has many orders, drawn with a crow’s foot at the Orders end.',
  layout: { size: [560, 220], minWidth: 560 },
  setup(s) {
    const c = s.tableBox(s.root, { x: 8, y: 8, w: 200, name: 'Customers', keys: 'pk', fields: [{ name: 'CustomerID', key: 'P' }, 'Name', 'Email'] });
    const o = s.tableBox(s.root, { x: 340, y: 8, w: 210, name: 'Orders', keys: 'pk', fields: [{ name: 'OrderID', key: 'P' }, { name: 'CustomerID', key: 'F' }, 'OrderDate', 'Total'] });
    s.relation(s.root, { t: c, f: 'CustomerID', side: 'right' }, { t: o, f: 'CustomerID', side: 'left' }, { one: 'a', many: 'crow', mid: 274 });
  }
});
