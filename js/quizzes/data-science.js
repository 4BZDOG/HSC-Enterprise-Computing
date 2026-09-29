/* Quiz bank for Data Science (topics/data-science.html).
   One entry per data-quiz key on the page: ds-1, ds-2, ds-3.
   Each question: { q: "…", options: ["…", "…", "…", "…"], answer: <index of the right option>, why: "…" }. */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  // Part 1: Collecting, storing and analysing data
  'ds-1': [
    { q: "Bellbird Bikes asks riders to rate each trip as poor, fair, good or excellent. At which level of measurement is this variable?",
      options: ["Nominal, because the answers are words", "Ordinal, because the categories have an order but the gaps are not known to be equal", "Interval, because the ratings can be averaged", "Ratio, because \"excellent\" is the highest possible rating"],
      answer: 1,
      why: "The ratings can be ranked, so the level is above nominal, but nothing says the step from poor to fair equals the step from good to excellent, so it is not interval. Ratio needs a true zero." },
    { q: "Bellbird has 200 members and 400 casual riders and wants a sample of 60 that reflects both groups. Which method does this?",
      options: ["Convenience sampling at Market Square on a weekday", "Systematic sampling of every tenth trip", "Stratified random sampling of 20 members and 40 casual riders", "Asking for volunteers through the app"],
      answer: 2,
      why: "Stratified sampling divides the population into groups and samples each in proportion (members are one third of riders, so one third of the sample). Convenience and volunteer samples are self-selected and biased." },
    { q: "Which statement best explains why editing an old block on a blockchain is detected?",
      options: ["The chain is protected by a password known only to the owner", "Every block is encrypted, so it cannot be opened", "A hash can be reversed to restore the original data", "Each block stores the hash of the block before it, so a change breaks every later link, and the other copies of the ledger will not match"],
      answer: 3,
      why: "Changing a block changes its hash, so the next block's stored previous hash no longer matches. Many nodes hold copies and reach consensus, so the altered copy is rejected. Hashes are one-way and are not encryption." },
    { q: "Why does Bellbird load cleaned data into a data warehouse, instead of running large analyses directly on the operational database?",
      options: ["The warehouse records trips faster than the operational database", "Heavy queries would slow the live system, and the warehouse holds integrated historical data ready for analysis", "A warehouse stores only unstructured data such as photos", "The operational database cannot store dates"],
      answer: 1,
      why: "An operational database is built for quick day-to-day transactions. A warehouse is loaded through extract, transform and load (ETL) with cleaned, combined, historical data for analysis." },
    { q: "A sign-up form has a box already ticked: \"Share my details with our partners\". What is the main problem?",
      options: ["Pre-ticked boxes are opt-out, so consent may not be informed, specific or voluntary", "The box should be a drop-down list", "The box is too small to read", "Marketing consent is never allowed in Australia"],
      answer: 0,
      why: "Good practice is opt-in, where the user actively ticks a separate box for each purpose. Pre-ticked boxes rely on people not noticing, which weakens consent under privacy guidance." }
  ],
  // Part 2: Data quality
  'ds-2': [
    { q: "Which Australian law contains the Australian Privacy Principles (APPs)?",
      options: ["Copyright Act 1968", "Spam Act 2003", "Cybercrime Act 2001", "Privacy Act 1988"],
      answer: 3,
      why: "The 13 APPs are in Schedule 1 of the Privacy Act 1988 (Cth). The OAIC is the regulator." },
    { q: "A NSW public school collects personal information about its students. Which law and regulator are most directly relevant?",
      options: ["The Privacy and Personal Information Protection Act 1998 (NSW) and the Information and Privacy Commission NSW", "The Spam Act 2003 and the eSafety Commissioner", "The Copyright Act 1968 and IP Australia", "The Cybercrime Act 2001 and the ACCC"],
      answer: 0,
      why: "NSW public sector agencies, including public schools, are covered by the PPIP Act, and the IPC NSW oversees it. Federal privacy law applies to federal agencies and many private organisations." },
    { q: "Which statement best describes Indigenous data sovereignty?",
      options: ["The rule that data must be stored on servers in Australia", "The right of Aboriginal and Torres Strait Islander Peoples to govern the collection, ownership and use of data about their communities and cultures", "A licence that lets researchers use Indigenous data if they credit the source", "The requirement that all government data be published openly"],
      answer: 1,
      why: "The Maiam nayri Wingara principles and the CARE principles (Collective benefit, Authority to control, Responsibility, Ethics) centre community control of data about Aboriginal and Torres Strait Islander Peoples. Storing data in Australia is a different, national, meaning of data sovereignty." },
    { q: "Bellbird wants to publish its trip data as open data. Which step is most important before publishing?",
      options: ["Sort the data by rider name", "Convert the data into a chart", "Remove or generalise identifying details and test whether riders could be re-identified", "Delete the metadata so the file is smaller"],
      answer: 2,
      why: "Names, exact times and locations can identify people even when a name field is removed. De-identify, suppress small groups, check re-identification risk, and publish with a licence and a data dictionary." },
    { q: "A company keeps every kind of raw data in a data lake, with no catalogue, no owner and no quality checks. Over time nobody can find or trust anything in it. What is this called?",
      options: ["A data swamp", "A data mart", "A data warehouse", "A data dictionary"],
      answer: 0,
      why: "A data lake without governance becomes a data swamp. Metadata, ownership, quality checks and retention rules prevent it." }
  ],
  // Part 3: Processing and presenting data
  'ds-3': [
    { q: "Trip lengths are in column E. Which formula in H2 shows \"Long\" for trips of 30 minutes or more and \"Short\" otherwise?",
      options: ["=IF(E2>=30,\"Long\",\"Short\")", "=IF(E2>30,\"Long\",\"Short\")", "=IF(E2>=30,Long,Short)", "=E2>=30(\"Long\",\"Short\")"],
      answer: 0,
      why: "IF takes a condition, the value if true and the value if false, and text values go in quotation marks. Option A uses > and would label a 30-minute trip Short." },
    { q: "Using the Bellbird schema, which query lists the first names and surnames of casual riders in surname order?",
      options: ["SELECT Riders WHERE RiderType = 'Casual' ORDER BY Surname", "FROM Riders SELECT FirstName, Surname WHERE RiderType = 'Casual'", "SELECT FirstName, Surname FROM Riders ORDER BY Surname WHERE RiderType = 'Casual'", "SELECT FirstName, Surname FROM Riders WHERE RiderType = 'Casual' ORDER BY Surname ASC"],
      answer: 3,
      why: "The NESA keywords are used in the order SELECT (what to display), FROM (the table), WHERE (the criteria) and ORDER BY (the sequence). The other options omit FROM or put the clauses in the wrong order." },
    { q: "In the relational design, Trips holds RiderID, BikeID and StationID. What is the main benefit of storing these keys instead of the rider's name and the station's name on every trip?",
      options: ["The database becomes smaller only because numbers are always shorter than words", "It allows queries to be written without WHERE", "Each fact is stored once, so a change is made in one place and the data stays consistent", "It stops anyone from reading the data"],
      answer: 2,
      why: "Normalisation stores each fact once and links tables with foreign keys, which reduces duplication and protects data integrity. Keys do not by themselves make data secret." },
    { q: "On a dashboard, what does a slicer do?",
      options: ["Permanently deletes the rows that are not selected", "Filters the connected pivot tables and charts by the chosen values, without changing the source data", "Calculates a standard deviation", "Sorts the source table alphabetically"],
      answer: 1,
      why: "A slicer is a set of buttons that filters the pivot tables and charts it is connected to. The source data is unchanged and the view can be reset." },
    { q: "Bellbird has labelled examples of past trips (commute, leisure, suspected theft) and wants a model that decides which category a new trip belongs to. Which task is this?",
      options: ["Regression", "Clustering", "Classification", "Data warehousing"],
      answer: 2,
      why: "Assigning items to known categories, learned from labelled examples, is classification. Regression predicts a number, and clustering finds groups when no labels exist." }
  ],
});
