/* Still diagram (NESA schema): the Bellbird Bikes relational database, four linked tables.
   P marks a primary key and F a foreign key; 1 and ∞ show one-to-many relationships.
   Notation follows NESA Enterprise Computing Course Specifications, p.16.
   Data Science › Processing and presenting data (designing a relational database). */
HSCAnim.define('ds-schema-bikeshare', {
  still: true,
  title: 'Schema: the Bellbird Bikes database',
  alt: 'Schema with four tables. Trips has TripID (primary key), TripDate, Minutes, Km, Fare, RiderID (foreign key), BikeID (foreign key) and StationID (foreign key). Riders has RiderID (primary key), FirstName, Surname and RiderType. Bikes has BikeID (primary key) and Model. Stations has StationID (primary key), StationName and Docks. One rider, one bike and one station can each appear in many trips, so each relationship has 1 at the Riders, Bikes or Stations end and infinity at the Trips end. P means primary key and F means foreign key.',
  layout: { size: [780, 300], minWidth: 780 },
  setup(s) {
    const riders = s.tableBox(s.root, { x: 8, y: 8, w: 200, name: 'Riders', fields: [{ name: 'RiderID', key: 'P' }, 'FirstName', 'Surname', 'RiderType'] });
    const trips = s.tableBox(s.root, { x: 290, y: 8, w: 230, name: 'Trips', fields: [{ name: 'TripID', key: 'P' }, 'TripDate', 'Minutes', 'Km', 'Fare', { name: 'RiderID', key: 'F' }, { name: 'BikeID', key: 'F' }, { name: 'StationID', key: 'F' }] });
    const bikes = s.tableBox(s.root, { x: 590, y: 8, w: 180, name: 'Bikes', fields: [{ name: 'BikeID', key: 'P' }, 'Model'] });
    const stations = s.tableBox(s.root, { x: 590, y: 150, w: 180, name: 'Stations', fields: [{ name: 'StationID', key: 'P' }, 'StationName', 'Docks'] });
    s.relation(s.root, { t: riders, f: 'RiderID', side: 'right' }, { t: trips, f: 'RiderID', side: 'left' }, { one: 'a', mid: 249 });
    s.relation(s.root, { t: bikes, f: 'BikeID', side: 'left' }, { t: trips, f: 'BikeID', side: 'right' }, { one: 'a', mid: 550 });
    s.relation(s.root, { t: stations, f: 'StationID', side: 'left' }, { t: trips, f: 'StationID', side: 'right' }, { one: 'a', mid: 570 });
    s.text(s.root, 'P = Primary key', { x: 12, y: 284, anchor: 'start', cls: 'pa-t', size: 14 });
    s.text(s.root, 'F = Foreign key', { x: 170, y: 284, anchor: 'start', cls: 'pa-t', size: 14 });
  }
});
