/*
  * Versione jquery dello script di ordinamento
  *
  */

function getSortIndicator(descending) {
	return $("<span/>").text(descending?" [D]":" [A]");
}

function reorderRows(table,column,skipAbove,skipBelow,comparator) {

	var headrow = $("thead",table).length>0?$("thead",table):$("tr:eq(0)",table);	
	var cheader = $("th",headrow).eq(column);
	var prev_cheader = prev_cheader = $("th.ASC,th.DESC",headrow).eq(0);
	
	var trows = $("tr",table);
	var rowarray =  trows.slice(skipAbove, trows.length-(skipAbove+skipBelow-1));
	
	var descending;
	
	//annulla l'ordinamento precedente
	if (prev_cheader.length>0 && prev_cheader[0] != cheader[0]) {
		prev_cheader.removeClass("ASC DESC");
		$(".sortindicator",prev_cheader).remove();
	}
		
	//cerca e inverte l'ordinamento specificato nella classe	
	if (cheader.hasClass("DESC")) {
		descending=false;
		cheader.removeClass("DESC");
		cheader.addClass("ASC");		
	} else if (cheader.hasClass("ASC")) {
		descending=true;
		cheader.removeClass("ASC");
		cheader.addClass("DESC");
	} else {
		descending=false;
		cheader.addClass("ASC");		
	}
	
	var indicator = window.getSortIndicator?getSortIndicator(descending):null;
	if (indicator) {
		indicator.addClass("sortindicator");
		if ($(".sortindicator",cheader).replaceWith(indicator).length==0);
		cheader.append(indicator)
	}
	
	rowarray.sort(makeRowComparator(column,comparator))
	if (descending) rowarray.reverse();
	
	$(rowarray).insertAfter(trows.eq(skipAbove-1))

}

function makeRowComparator(column,comparator) {
	return function(r1,r2) {
		if ($("td",r1).length-1<column) return 1;
		else if ($("td",r2).length-1<column) return -1;
		else return comparator($("td",r1).eq(column).text(),$("td",r2).eq(column).text())
	}
}

function makeRowReorderer(table,column,skipAbove,skipBelow,comparator) {
	return function(e) {
		reorderRows(table,column,skipAbove,skipBelow,comparator);		
	};
}


function stringcompare(s1,s2) { return (s1 > s2); };
function numbercompare(n1,n2) { return (parseInt(n1) > parseInt(n2)); }


function setupOrderedTable(table) {
	var headrow = $("thead",table).length>0?$("thead",table):$("tr:eq(0)",table);
	$("th",headrow).each(function(i) {		
		var header = $(this);
		if (header.hasClass("number"))
			header.bind('click',makeRowReorderer(table,i,1,0,numbercompare));
		else
			header.bind('click',makeRowReorderer(table,i,1,0,stringcompare));
	 });
}


function scanTables() {
	 $("table.ordered").each(function() {setupOrderedTable(this)});
}

//inizializzazione dello script
$(function() {
	$.fn.reverse = [].reverse;
	scanTables();
});
