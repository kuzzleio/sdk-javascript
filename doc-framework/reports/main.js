function setLanguage(language) {
  var languageContainer = document.getElementById('language');
  languageContainer.innerHTML = language
}

function setDatetime(datetime) {
  var datetimeContainer = document.getElementById('datetime');
  datetimeContainer.innerHTML = datetime;
}

function setNumber(dataArr) {
  var numberContainer = document.getElementById('number');
  numberContainer.innerHTML = dataArr.length;
}

function getTestCounts(dataArray) {
  var
    fail = 0,
    success = 0;

  dataArray.forEach(el => {
    switch (el.status) {
      case 'Success':
        ++success;
        break;
      case 'Fail':
        ++fail;
        break;
      default:
        throw new Error(`Unknown status ${el.status}`);
    }
  });

  return {
    total: dataArray.length,
    fail: fail,
    success: success
  };
}

function getData(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var res = xhr.responseText;
        try {
          callback(JSON.parse(res));
        }
        catch (e) {
          callback(res);
        }
      } else {
        console.error(xhr.statusText);
      }
    }
  };

  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}

getData('report.json', function (report) {
  var dataArr = Object.values(report)

  var columnDefs = [
    { headerName: "NAME", field: "name" },
    { headerName: "DESCRIPTION", field: "description" },
    { headerName: "STATUS", field: "status" },
    { headerName: "EXPECTED", field: "expected" },
    { headerName: "GOT", field: "got", cellRenderer: function(params){return (!params.value.isError) ? params.value.text : '<a class="error-link" href="#" data-content="' + params.value.text +'">' + params.value.text.substr(0, 70) + '...</a>'} },
    { headerName: "FILE", field: "file", cellRenderer: function(params){return '<a class="file-link" href="#" data-file="' + params.value.split('/').pop() +'">' + params.value + '</a>'} }
  ];

  var rowData = [];
  dataArr.forEach(function (el) {
    var gotColData = {
      isError: el.status === 'Fail',
      text: (Object.keys(el.error).length !== 0) ? el.error.code + ' : ' + el.error.got : el.test.expect
    };
    rowData.push({
      name: el.test.name,
      description: el.test.description,
      status: el.status,
      expected: el.test.expect,
      got: gotColData,
      file: el.file
    })
  });

  var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    enableSorting: true,
    gridAutoHeight: true,
    rowClassRules: {
      'bg-success': function (params) {
        return params.data.status === 'Success';
      },
      'bg-fail': function (params) {
        return params.data.status === 'Fail';
      }
    }
  };

  var eGridDiv = document.querySelector('#myGrid');
  var grid = new agGrid.Grid(eGridDiv, gridOptions);
  var allColumnIds = [];
  gridOptions.columnApi.getAllColumns().forEach(function (column) {
    allColumnIds.push(column.colId);
  });
  gridOptions.columnApi.autoSizeColumns(allColumnIds);

  // CHARTS
  var testCount = getTestCounts(dataArr);
  var ctx = document.getElementById("pie-chart").getContext("2d");

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Success', 'Fail'],
      datasets: [{
        label: 'Tests status',
        backgroundColor: ['#90EE90', '#F08080', '#ADD8E6', '#778899'],
        data: [testCount.success, testCount.fail]
      }]
    },
    options: {
      responsive: false
    }
  });

  setLanguage(dataArr[0].language);
  setDatetime(dataArr[0].datetime);
  setNumber(dataArr);

});

// SEE FILE MARKDOWN
$(document).on('click', 'a.file-link', function (e) {
  e.preventDefault();
  var file = $(this).data('file');
  getData('failed/' + file, function(fileContent){
    var
      converter = new showdown.Converter(),
      html = converter.makeHtml('```' + file.split('.')[1] +'\n' + fileContent + '\n```');

    $('.modal').html(html);
    $('.modal').modal();
    $('.modal pre').addClass('line-numbers')
    Prism.highlightAll();
    return false;
  });
});

// SEE ERROR MARKDOWN
$(document).on('click', 'a.error-link', function (e) {
  e.preventDefault();
  var error = $(this).data('content').replace(/,/g, '<br>');

  $('.modal').html(error);
  $('.modal').addClass('modal-error');
  $('.modal').modal();
  return false;
});

$(document).on($.modal.BEFORE_CLOSE, function(event, modal) {
  $('.modal').removeClass('modal-error');
});
