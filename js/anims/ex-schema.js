/* Still diagram (NESA schema): the Canteen Insights database (a fictional project) with three linked tables.
   P marks a primary key and F a foreign key; 1 and the infinity sign show a one-to-many relationship.
   NESA Enterprise Computing Course Specifications, p.16 (redrawn with the diagram kit).
   Example Enterprise Project › Researching and planning (data design). */
HSCAnim.define('ex-schema', {
  still: true,
  title: 'Schema: the Canteen Insights database',
  alt: 'Schema with three tables. DailySales has the fields SaleID (primary key), SaleDate, ItemID (foreign key), Prepared, Sold and Wasted. Items has ItemID (primary key), ItemName, CategoryID (foreign key), UnitPrice, UnitCost, Perishable and OnHand. Categories has CategoryID (primary key) and CategoryName. One item has many daily sales records, joined on ItemID, and one category has many items, joined on CategoryID. P means primary key and F means foreign key.',
  layout: { size: [760, 300], minWidth: 760 },
  setup(s) {
    const sales = s.tableBox(s.root, { x: 8, y: 8, w: 210, name: 'DailySales', fields: [{ name: 'SaleID', key: 'P' }, 'SaleDate', { name: 'ItemID', key: 'F' }, 'Prepared', 'Sold', 'Wasted'] });
    const items = s.tableBox(s.root, { x: 290, y: 8, w: 210, name: 'Items', fields: [{ name: 'ItemID', key: 'P' }, 'ItemName', { name: 'CategoryID', key: 'F' }, 'UnitPrice', 'UnitCost', 'Perishable', 'OnHand'] });
    const cats = s.tableBox(s.root, { x: 552, y: 8, w: 200, name: 'Categories', fields: [{ name: 'CategoryID', key: 'P' }, 'CategoryName'] });
    s.relation(s.root, { t: items, f: 'ItemID', side: 'left' }, { t: sales, f: 'ItemID', side: 'right' }, { one: 'a', mid: 254 });
    s.relation(s.root, { t: cats, f: 'CategoryID', side: 'left' }, { t: items, f: 'CategoryID', side: 'right' }, { one: 'a', mid: 526 });
    s.text(s.root, 'P = Primary key', { x: 12, y: 268, anchor: 'start', cls: 'pa-t', size: 14 });
    s.text(s.root, 'F = Foreign key', { x: 170, y: 268, anchor: 'start', cls: 'pa-t', size: 14 });
  }
});
