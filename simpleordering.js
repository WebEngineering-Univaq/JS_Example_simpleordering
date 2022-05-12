/*

WEB EGINEERING COURSE - University of L'Aquila 

This example shows a simple technique for client-side table sorting.

See the course homepage: http://www.di.univaq.it/gdellape/students.php

*/

//questa funzione riordina le righe della tabella table, escludendo skipAbove righe in alto e skipBelow righe in basso,
//in base ai valori presenti nella colonna column ordinati come previsto dalla funzione comparator
//this function sorts the rows of the given table, excluding skipAbove and skipBelow rows from the top and from the bottom, 
//respectively, using the values in the given column as the sort key, ordered as defined by the comparator function.
function reorderRows(table,column,skipAbove,skipBelow,comparator) {
	//acquisiamo un riferimento al body della tabella (si veda il DOM HTML)
	//get a reference to the table boby
	var tbody = table.tBodies.item(0);
	var trows = table.rows;
	var headers = trows.item(0).getElementsByTagName('th');
	var cheader = headers.item(column);
	var cheader_class = cheader.className;
	
	var rowarray = [];
	var descending;
	var i;
	
	//cerchiamo la precendete colonna di ordinamento, se esiste
	//ed eliminiamo il suo hint visuale
	//get the previous ordering column, if exists, and delete its visual hint
	for(i=0; i<headers.length; ++i) {
		if (headers.item(i).className.indexOf("DESC")>=0 || headers.item(i).className.indexOf("ASC")>=0) {
			var prev_cheader = headers.item(i);
			if (prev_cheader != cheader) {
				modifyColumnClass(table,i,skipAbove,skipBelow, "ordering", true);
				prev_cheader.className = prev_cheader.className.replace(/DESC|ASC/g, "");
				if (prev_cheader.lastChild.className=="sortindicator") prev_cheader.removeChild(prev_cheader.lastChild);
			}
			break;
		}		
	}
		
	//cerchiamo e invertiamo l'ordinamento specificato nella classe dell'intestazione cliccata	
	//get and invert the ordering specified in the class of the clicked column header
	if (cheader_class.indexOf("DESC")>=0) {
		descending=false;
		cheader.className = cheader_class.replace(/DESC/g, "ASC");
	} else if (cheader_class.indexOf("ASC")>=0) {
		descending=true;
		cheader.className = cheader_class.replace(/ASC/g, "DESC");
	} else {
		descending=false;
		cheader.className += " ASC";
	}
	
	//inseriamo l'hint visuale di ordinamento sulla colonna cliccata
	//add the visual ordering hint on the ckicked column header
	var indicator = getSortIndicator(descending);
	if (indicator) {
		indicator.className = "sortindicator";
		if (cheader.lastChild.className=="sortindicator") cheader.replaceChild(indicator,cheader.lastChild);
		else cheader.appendChild(indicator)
	}
	modifyColumnClass(table,column,skipAbove,skipBelow, "ordering", false);
	
	//trasferiamo le righe in un array JS
	//copy the table rows in a JS array
	for(i=skipAbove; i<trows.length-skipBelow; ++i) rowarray.push(trows.item(i));

	//ordiniamo l'array delle righe
	//aroder the row array
	rowarray.sort(makeRowComparator(column,comparator))
	if (descending) rowarray.reverse();
	
	//trasferiamo le righe ordinate nella tabella. trucco: inserire un oggetto dom in una certa posizione lo
	//rimuove automaticamente da quella precedente
	//move back the ordere rows to the table. Suggestion: if we insert a DOM object in a certain document position,
	//it is automatically removed from its previous location.
	for(i=rowarray.length-1; i>=0; --i) tbody.insertBefore(rowarray[i],trows.item(skipAbove));
}

//questa funzione, data una funzione di confronto (comparator) tra tipi base (stringhe, numeri, ecc.), restituisce una
//nuova funzione che esegue l'ordinamento di righe (<tr>) confrontando il testo contenuto nella colonna column di ciascuna
//tramite il comparator
//this function, given a comparison function (comparator) between base data types (strings, numbers, ...), returns a new
//function which sorts the rows (<tr>) comparing the text contained in their given column through the comparator
function makeRowComparator(column,comparator) {
	return function(r1,r2) {
		if (r1.cells.length-1<column) return 1;
		else if (r2.cells.length-1<column) return -1;
		else return comparator(r1.cells.item(column).textContent,r2.cells.item(column).textContent);
	}
}

//questa funzione applica una particolare classe a tutte le celle di una determinata colonna, escludendo
//eventualmente quelle definite da skipAbove e skipBelow
//this function applies a give class to all the cells in a given column, possibly excluding 
// skipAbove and skipBelow rows from the top and from the bottom, respectively
function modifyColumnClass(table,column,skipAbove,skipBelow,className,remove)
{
	var tbody = table.tBodies.item(0);
	var trows = table.rows;
	for(i=skipAbove; i<trows.length-skipBelow; ++i) {
		if (trows.item(i).cells.length>=column) {
			var cell = trows.item(i).cells.item(column);
			if (remove) {
				cell.className = cell.className.replace(new RegExp(className,"g"), "");
			} else if (cell.className.indexOf(className)<0) {
				cell.className += " "+className;
			}
		}
	}
}

//questa funzione crea un event handler che attiva il riordinamento con particolari parametri
//this function creates an event handler that reorders the table with specific parameters
function makeRowReorderer(table,column,skipAbove,skipBelow,comparator) {
	return function(e) {		
		reorderRows(table,column,skipAbove,skipBelow,comparator);		
	};
}

//funzioni di ordinamento di base
//base ordering functions
function stringcompare(s1,s2) { return (s1 > s2); };
function numbercompare(n1,n2) { return (parseInt(n1) > parseInt(n2)); }

//questa funzione rende ordinabile una tabella data inserendo gli opportuni event handler
//sulle intestazioni delle colonne nella prima riga
//this function makes sortable the ginven table, by adding suitable event handlers
//on the column headings
function setupOrderedTable(table) {
	var headings = table.rows.item(0).getElementsByTagName('th');
	var i;
	
	 for(i=0; i<headings.length; ++i) {	
		//decidiamo il tipo di dato della colonna guardando la sua classe...
		//determine the column data type from its class...
		if (headings.item(i).className.indexOf("number")>=0) {
			headings.item(i).title = "Clicca per ordinare (ordine numerico)";
			headings.item(i).onclick=makeRowReorderer(table,i,1,0,numbercompare);
		} else if (headings.item(i).className.indexOf("string")>=0) {
		headings.item(i).title = "Clicca per ordinare (ordine lessicografico)";
			headings.item(i).onclick=makeRowReorderer(table,i,1,0,stringcompare);
		}
	 }
}

//questa funzione analizza tutte le tabelle del documento e rende ordinabili quelle 
//che hanno la classe "ordered".
//this function scans all the document tables and makes sortable the ones with
//with the "ordered" class
function scanTables() {
	 var tables = document.getElementsByTagName('table');
	 var i;
	 
	 for(i=0; i<tables.length; ++i) {
		if (tables.item(i).className.indexOf("ordered")>=0) {
			setupOrderedTable(tables.item(i))
		}	 
	 }
}

function getSortIndicator(descending) {
	var span = document.createElement("span");
	span.textContent = descending?" [D]":" [A]";
	return span;
}

//inizializzazione dello script
//script initialization
function init() {
	scanTables();
}

window.onload=init;