// Import dependencies
const csv = require("csvtojson");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

(async () => {
  // reading all volunteers  attendance data from the given csv file
  const volunteers = await csv().fromFile("volunteer_attendance_data.csv");

  // Finding all unique dates
  const uniqueDates = [];
  for (let i = 0; i < volunteers.length; i++) {
    const element = volunteers[i].date;
    let index = uniqueDates.indexOf(element);
    if (index === -1) {
      uniqueDates.push(element);
    }
  }

  // sorting the unique dates
  const dates = uniqueDates.sort();

  // saving date waise data in arrays of objects
  const dateArray = dates.map((date) => {
    return volunteers.filter((individualVolunteer) => {
      return date === individualVolunteer.date;
    });
  });

  // creating a csv file
  const csvWriter = createCsvWriter({
    path: "output.csv",
    header: [
      { id: "node1", title: "node1" },
      { id: "node2", title: "node2" },
      { id: "weight", title: "weight" },
    ],
  });

  // function to capitalize & trim volunteer names
  const capitalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .split(" ")
      .map((word) => {
        return word[0].toUpperCase() + word.substr(1);
      })
      .join(" ");
  };

  // Finding all the nodes and their connections/overlapped shift
  const overlappedVolunteers = [];
  for (let i = 0; i < volunteers.length; i++) {
    for (let j = 0; j < volunteers.length; j++) {
      if (
        volunteers[i].shift === volunteers[j].shift &&
        volunteers[i].date === volunteers[j].date &&
        volunteers[i].volunteerId !== volunteers[j].volunteerId
      ) {
        let dataSetOne = {
          name: capitalize(volunteers[i].volunteerName),
          date: volunteers[i].date,
          shift: volunteers[i].shift,
        };

        let dataSetTwo = {
          name: capitalize(volunteers[j].volunteerName),
          date: volunteers[j].date,
          shift: volunteers[j].shift,
        };

        let connection1 = {
          dataSetOne,
          dataSetTwo,
        };

        overlappedVolunteers.push(connection1);
      }
    }
  }

  //Finding volunteers who had multiple overlapping shifts/weight.
  // using another approach (based on date wise data array) to loop over the volunteers data
  let output = [];
  for (let i = 0; i < dateArray.length; i++) {
    const element = dateArray[i];

    for (let j = 0; j < element.length; j++) {
      for (let k = 0; k < element.length; k++) {
        if (
          element[j].shift === element[k].shift &&
          element[j].volunteerId !== element[k].volunteerId
        ) {
          // capitalizing volunteerName
          const volunteerOne = capitalize(element[j].volunteerName);
          const volunteerTwo = capitalize(element[k].volunteerName);

          let count = 0;

          for (let w = 0; w < overlappedVolunteers.length; w++) {
            const overlappedContainer = overlappedVolunteers[w];
            if (
              overlappedContainer.dataSetOne.name.match(volunteerOne) &&
              overlappedContainer.dataSetTwo.name.match(volunteerTwo)
            ) {
              count++;
            }
          }

          let connection = {
            node1: volunteerOne,
            node2: volunteerTwo,
            weight: count,
          };

          output.push(connection);
        }
      }
    }
  }

  csvWriter.writeRecords(output).then(() => {
    console.log("Done");
  });
})();
