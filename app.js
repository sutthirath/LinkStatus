window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded: JavaScript Ready!");
  const startBtn = document.querySelector("#start");
  startBtn.addEventListener("click", () => {
    startBtn.classList.add("hidden");
    crawler();
  });
});

async function crawler() {
  console.log("FUNCTION: crawler");
  const urlMsg = document.querySelector("#urlMsg"),
    userInput = document.querySelector("#urls").value,
    urls = userInput
      .slice()
      .split(/\https:|\http:|\/\//)
      .filter(str => str !== "");
  let allLinks = {};

  urlMsg.textContent = `Analzying ${urls.length} URLs...`;

  await Promise.all(
    urls.map(async (url, i) => {
      await fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
        method: "GET",
        mode: "cors"
      })
        .then(res => res.text())
        .then(text => {
          console.log(i);
          const parser = new DOMParser(),
            htmlDoc = parser.parseFromString(text, "text/html"),
            pageLinks = htmlDoc.documentElement.querySelectorAll("a"),
            links = [...pageLinks];
          allLinks[url] = links;
          return allLinks;
        });
    })
  );

  console.log(allLinks);
  analyze(urls, allLinks);
}

function analyze(urls, links) {
  console.log("FUNCTION: analyze");

  const progress = document.querySelector("#progress");
  let data = [];

  if (!links || Object.entries(links).length === 0) {
    progress.textContent = "No links found";
  } else {
    const arr = Object.keys(links);
    for (let i = 0; i < arr.length; i++) {
      links[arr[i]].map((link, idx) => {
        let node = {};
        fetch(`https://cors-anywhere.herokuapp.com/${link}`, {
          method: "HEAD",
          mode: "cors"
        })
          .then(res => {
            node["page"] = arr[i];
            node["index"] = idx;
            node["url"] = link.href;
            node["status"] = res.status;
            node["redirect"] = res.redirected;
            node["message"] = res.statusText;
            node["element"] = link.outerHTML;
            data.push(node);
          })
          .catch(err => {
            console.log(err);
          });
      });
    }
  }
  setTimeout(() => {
    buildReport(links, urls, data);
  }, 10000);
}

/*
Group Page column by incrementing the rowspan per link
Need to remove loop that creates Page header
If obj["index"] === 0 then create Page header
Else leave the cell0 empty
*/
function buildReport(links, headers, data) {
  console.log("FUNCTION: buildReport");
  console.log(data);
  console.log("Length: ", data.length);
  const progress = document.querySelector("#progress"),
    report = document.querySelector("#report"),
    table = document.querySelector("#table-report"),
    pages = Object.values(links);

  progress.textContent = "Success, your report is ready!";
  report.classList.add("show");

  // Create first row/column for Pages
  for (let i = 0; i < headers.length; i++) {
    let header = document.createElement("td"),
      row = table.insertRow(i);
    header.textContent = headers[i];
    header.setAttribute("id", `header${i + 1}`);
    header.setAttribute("class", "header");
    header.setAttribute("rowspan", `${pages[i].length}`);
    row.appendChild(header);
    row.parentNode.setAttribute("id", "body");
  }

  // Create Page Headers
  let body = document.querySelector("#body"),
    tHead = document.querySelectorAll(".header"),
    title = table.createTHead(),
    row = table.insertRow(0),
    cell0 = row.insertCell(0),
    cell1 = row.insertCell(1),
    cell2 = row.insertCell(2),
    cell3 = row.insertCell(3),
    cell4 = row.insertCell(4),
    cell5 = row.insertCell(5),
    cell6 = row.insertCell(6);
  title.setAttribute("id", "head");
  cell0.textContent = `Page`;
  cell1.textContent = `Index`;
  cell2.textContent = `Url`;
  cell3.textContent = `Status`;
  cell4.textContent = `Redirect`;
  cell5.textContent = `Message`;
  cell6.textContent = `Element`;
  title.appendChild(row);

  console.log("TABLE!!!!!: ", table);

  // Create Table Cells
  for (let obj of data) {
    console.log("Creating Cell...");
    let check = true,
      i = 0;
    while (check) {
      if (obj["page"] === tHead[i].textContent) {
        let row = document.createElement("tr"),
          cell1 = row.insertCell(0),
          cell2 = row.insertCell(1),
          cell3 = row.insertCell(2),
          cell4 = row.insertCell(3),
          cell5 = row.insertCell(4),
          cell6 = row.insertCell(5),
          link = document.createElement("a"),
          linkText = document.createTextNode(`${obj["url"]}`);
        link.setAttribute("href", `${obj["url"]}`);
        link.appendChild(linkText);
        cell1.textContent = `${obj["index"] + 1}`;
        cell2.appendChild(link);
        cell3.textContent = `${obj["status"]}`;
        cell4.textContent = `${obj["redirect"]}`;
        cell5.textContent = `${obj["message"]}`;
        cell6.textContent = `${obj["element"]}`;
        body.appendChild(row);
        check = false;
      } else {
        i++;
      }
    }
  }

  if (!data && data.length === 0) {
    console.log("Unsuccessful");
    console.log("Table data: ", data);
    progress.textContent = "Data Error";
  }
}

function viewReport() {
  console.log("FUNCTION: viewReport");
  const progress = document.querySelector("#progress"),
    reportDoc = document.querySelector("#container-report");
  let reportWindow = window.open();

  if (progress.textContent === "Success, your report is ready!") {
    reportWindow.document.write(reportDoc.innerHTML);
  }
}
