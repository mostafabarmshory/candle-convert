$(document).ready(function() {
	$("#fileToUpload").change(handleFileSelect);
});




function exportToCsv(filename, rows) {
	var processRow = function(row) {
		var finalVal = '';
		for (var j = 0; j < row.length; j++) {
			var innerValue = row[j] === null ? '' : row[j].toString();
			if (row[j] instanceof Date) {
				innerValue = row[j].toLocaleString();
			};
			var result = innerValue.replace(/"/g, '""');
			if (result.search(/("|,|\n)/g) >= 0)
				result = '"' + result + '"';
			if (j > 0)
				finalVal += ',';
			finalVal += result;
		}
		return finalVal + '\n';
	};

	var csvFile = '';
	for (var i = 0; i < rows.length; i++) {
		csvFile += processRow(rows[i]);
	}

	var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(blob, filename);
	} else {
		var link = document.createElement("a");
		if (link.download !== undefined) { // feature detection
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}

function handleFileSelect(evt) {
	var file = evt.target.files[0];
	$('#tables_section').empty();
	$('p#errors').empty();
	$('p#loading').html('Parsing the file ...');
	Papa.parse(file, {
		header: true,
		dynamicTyping: true,
		complete: function(results) {
			$('p#loading').html('Parsing the file is completed. The number of rows: ' + results.data.length);
			if (results.errors && results.errors.length > 0) {
				var message = "Number of errors: " + results.errors.length + "<br>";
				var firstError = results.errors[0];
				message += "Row [" + firstError['row'] + "]: " + firstError['message'];
				$('p#errors').html(message);
			}
			var data = results.data;
			var advGetData = [[
				'<TICKER>',
				'<PER>',
				'<DTYYYYMMDD>',
				'<TIME>',
				'<OPEN>',
				'<HIGH>',
				'<LOW>',
				'<CLOSE>',
				'<VOL>'
			]];
			data.forEach(function(item) {
				var myDate = new Date(item.time);
				var newItem = [
					'BINANCE_LINKUSDT-1D',
					'D',
					yyyymmdd(myDate),
					'000000',
					item['open'],
					item['high'],
					item['low'],
					item['close'],
					item['Volume']
				];
				advGetData.push(newItem);
			});
			exportToCsv('export.csv', advGetData)
		}
	});
}

function yyyymmdd(dt) {
	var mm = dt.getMonth() + 1; // getMonth() is zero-based
	var dd = dt.getDate();

	return [dt.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('');
};