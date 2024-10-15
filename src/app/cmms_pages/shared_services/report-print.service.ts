import { Injectable } from '@angular/core';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { environment } from 'src/environments/environment';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class ReportPrintService {
  orientation: any = 'l';
  constructor() { }


  downloadReport(report_type: any, selectedReportFields: any, reportTitle: any, tableName: any, reportName: any) {
    var page_size = "";
    this.orientation = "l";

    // if (selectedReportFields.length > 14 && selectedReportFields.length <= 17) {
    //   this.orientation = "l";
    //   page_size = 'a4';
    // } else if (selectedReportFields.length > 17) {
    //   this.orientation = "l";
    //   page_size = 'a3';
    // } else {
    //   this.orientation = "p";
    //   page_size = 'a4';
    // }
    if (tableName == 'detail_table') {
      page_size = 'a3';
    }else{
      page_size = 'a4';
    }

    var logo1 = new Image();
    logo1.src = "assets/images/ti_murugappa.png";

    // var logo2 = new Image();
    // logo2.src = "";

    const doc = new jsPDF(this.orientation, 'mm', page_size);

    doc.setTextColor(23, 162, 184);

    if (page_size == 'a4') {
      if (this.orientation == 'l') {
        doc.addImage(logo1, 'png', 4, 3, 50, 12);
        // doc.addImage(logo2, 'png', 263, 4, 56, 10);

        doc.setFontSize(13);
        doc.text(reportTitle, 150, 10, { align: 'center', baseline: 'bottom', maxWidth: 200 });
      } else {
        doc.addImage(logo1, 'png', 4, 3, 50, 8.7);
        // doc.addImage(logo2, 'png', 175.6, 4, 25, 10);

        doc.setFontSize(13);
        doc.text(reportTitle, 105, 10, { align: 'center', baseline: 'bottom', maxWidth: 100 });
      }
    } else {
      doc.addImage(logo1, 'png', 4, 3, 50, 8.7);
      // doc.addImage(logo2, 'png', 386, 4, 29.6, 8.7);

      doc.setFontSize(14);
      doc.text(reportTitle, 210, 10, { align: 'center', baseline: 'bottom', maxWidth: 300 });
    }
    autoTable(doc, {
      html: '#' + tableName,
      margin: {
        top: 16,
        left: 4,
        right: 4,
        bottom: 5
      },
      includeHiddenHtml: true,
      theme: "grid",
      rowPageBreak: 'avoid',
      styles: {
        minCellHeight: 10,
        cellPadding: 1,
        fontSize: 8,
        fillColor: 255,
        textColor: 0,
        fontStyle: 'normal',
        overflow: "linebreak",
        halign: "center",
        valign: "middle",
        lineColor: 160,
        lineWidth: 0.1,
        font: "helvetica"
      },
      headStyles: {
        fillColor: [9, 127, 145],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        font: "helvetica"
      },

    });
    if (report_type == "report_print") {
      doc.autoPrint();
      window.open(
        URL.createObjectURL(doc.output("blob"))
      );
    } else if (report_type == "report_pdf") {
      doc.save(reportName);
    } else if (report_type == "report_csv") {
      var csv = [];
      csv.push(', , ,' + reportTitle + '\r\n');
      var rows = document.querySelectorAll("#" + tableName + " tr");
      for (var i = 0; i < rows.length; i++) {
        var row = [],
          cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++) {

          row.push(cols[j].textContent);
          if (j == (cols.length - 1)) {
            row.push("\n")
          }
        }
        csv.push(row.join(","));
      }

      var csvFile;
      var downloadLink;
      csvFile = new Blob(csv, { type: "text/csv" });
      downloadLink = document.createElement("a");
      downloadLink.download = reportName;
      downloadLink.href = window.URL.createObjectURL(csvFile);
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
    } else {
      var str = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
      str += '    <head>';
      str += '        <!--[if gte mso 9]>';
      str += '            <xml>';
      str += '                <x:ExcelWorkbook>';
      str += '                    <x:ExcelWorksheets>';
      str += '                        <x:ExcelWorksheet>';
      str += '                            <x:Name>' + reportName + '</x:Name>';
      str += '                            <x:WorksheetOptions>';
      str += '                                <x:DisplayGridlines/>';
      str += '                            </x:WorksheetOptions>';
      str += '                        </x:ExcelWorksheet>';
      str += '                    </x:ExcelWorksheets>';
      str += '                </x:ExcelWorkbook>';
      str += '            </xml>';
      str += '        <![endif]-->';
      str += '	    <style>';
      str += '		    table thead tr th{ background-color: #17a2b8; color:#fff;font-weight: bold;font-size: 16px;height: 30px;vertical-align: middle;text-align: center; }' +
        '               table tbody tr td{ vertical-align: middle;height: 20px;text-align: left; }';
      str += '	    </style>';
      str += '    </head>';
      str += '    <body>';
      str += '        <table border="1" cell-padding=5 cell-spacing=4>';
      str += '			<tr>';
      // str += '        <td class="text-center"><img src="' + (logo1.src) + '" width="5%" /></td>';
      str += '        <td class="text-center"><img src="" width="5%" /></td>';
      // str += '				<td colspan="' + (selectedReportFields.length - 2) + '" style="height: 80px;text-align: center;font-size: 20px;font-weight: bold;vertical-align: middle">' + reportTitle + '</td>';
      str += '				<td" style="height: 80px;text-align: center;font-size: 20px;font-weight: bold;vertical-align: middle">' + reportTitle + '</td>';
      // str += '        <td><img src="' + (logo2.src) + '" width="9%" height="" /></td>';
      str += '        <td><img src="" width="9%" height="" /></td>';
      str += '			</tr>';
      str += $('#' + tableName).html();
      str += '        </table>';
      str += '    </body>';
      str += '</html>';

      var uri = 'data:application/vnd.ms-excel,' + escape(str);

      var link = document.createElement("a");
      link.href = uri;

      link.download = reportName + ".xls";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
