/* Still diagram (NESA schema): a games database with three linked tables.
   P marks a primary key and F a foreign key; 1 and ∞ show a one-to-many relationship.
   NESA Enterprise Computing Course Specifications, p.16 (redrawn with the diagram kit).
   Enterprise Computing › Data science (relational databases and schemas). */
HSCAnim.define('spec-schema-games', {
  still: true,
  title: 'Schema: a games database',
  alt: 'Schema with three tables. Games has the fields ID (primary key), Name, Release_date, Cost, Publisher_ID (foreign key) and Developer_ID (foreign key). Publishers has Publisher_ID (primary key) and Name. Developers has Developer_ID (primary key), First_name and Last_name. One publisher has many games, joined on Publisher_ID, and one developer has many games, joined on Developer_ID. P means primary key and F means foreign key.',
  layout: { size: [740, 270], minWidth: 740 },
  setup(s) {
    const games = s.tableBox(s.root, { x: 8, y: 8, w: 210, name: 'Games', fields: [{ name: 'ID', key: 'P' }, 'Name', 'Release_date', 'Cost', { name: 'Publisher_ID', key: 'F' }, { name: 'Developer_ID', key: 'F' }] });
    const pubs = s.tableBox(s.root, { x: 288, y: 8, w: 200, name: 'Publishers', fields: [{ name: 'Publisher_ID', key: 'P' }, 'Name'] });
    const devs = s.tableBox(s.root, { x: 528, y: 8, w: 200, name: 'Developers', fields: [{ name: 'Developer_ID', key: 'P' }, 'First_name', 'Last_name'] });
    s.relation(s.root, { t: pubs, f: 'Publisher_ID', side: 'left' }, { t: games, f: 'Publisher_ID', side: 'right' }, { one: 'a', mid: 253 });
    s.relation(s.root, { t: devs, f: 'Developer_ID', side: 'left' }, { t: games, f: 'Developer_ID', side: 'right' }, { one: 'a', mid: 508 });
    s.text(s.root, 'P = Primary key', { x: 12, y: 236, anchor: 'start', cls: 'pa-t', size: 14 });
    s.text(s.root, 'F = Foreign key', { x: 170, y: 236, anchor: 'start', cls: 'pa-t', size: 14 });
  }
});
