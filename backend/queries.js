const { response, request } = require('express');
const Excel = require('exceljs');
const fs = require("fs");
const Pool = require('pg').Pool;
const pool = new Pool({
  user: process.env.REACT_APP_DB_USER,
  host: process.env.REACT_APP_DB_HOST,
  database: process.env.REACT_APP_DB_DATABASE,
  password: process.env.REACT_APP_DB_PASSWORD,
  port: process.env.REACT_APP_DB_PORT,
});


const getTemplateAboutLinka = (request, response) => {
    const prodLinkaId = request.body.PLine_id
    const query = `SELECT PLine.*, Operation.*, Process.*
    FROM public."ProductionLine" PLine
    JOIN public."Operation" Operation ON PLine."PLine_id" = Operation."PLine_id_ProductionLine"
    JOIN public."Process" Process ON Operation."Operation_id" = Process."Operation_id_Operation"
    WHERE PLine."PLine_id" = $1;
    `;
    pool.query(query, [prodLinkaId], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}


const getNameOfLine = (request, response) => {
    const prodLinkaId = request.body.PLine_id
    const query = 
    `SELECT "PLine_name"
	FROM public."ProductionLine"
    WHERE "PLine_id"=$1`;
    pool.query(query, [prodLinkaId], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
    }


const getTypyLinek = (request, response) => {
    const query = 
    `SELECT "PLine_id", "PLine_name"
	FROM public."ProductionLine"`;
    pool.query(query, (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
    }

    
const insetFinalData = (request, response) => {    
    const wholeReport = request.body;    
    const name = request.body[0].report_linka;
    const time = request.body[0].report_time;
    const initValues = [name, time];    
    const query =
        `INSERT INTO public."FinalReport"(
            "FReport_name", "FReport_time")
            VALUES ($1, $2) RETURNING "FReport_id";`; 
    pool.query(query, initValues, (error, results) => {
        if (error) {
        throw error;
        }    
        const reportId = results.rows[0].FReport_id;   
        wholeReport.forEach(item => {
        const report_values = [
            item.report_linka,
            item.report_operation,
            item.report_process,
            item.report_user,
            item.report_data,
            reportId
        ];
        const query =
            `INSERT INTO public."ReportData"(
                    "RData_linka", "RData_Operation", "RData_process", "RData_user", "RData_data", "FReport_id_FinalReport")
                    VALUES ($1, $2, $3, $4, $5, $6);`;
        pool.query(query, report_values, (error, results) => {
            if (error) {
            throw error;
            }
        });
        });    
        response.status(200).send("Inserted successfully");
    });
    };


const adminReports = (request, response) => {
    const lineId = request.body.PLine_id
    const queryX = `
    SELECT "PLine_name"
    FROM public."ProductionLine"
    WHERE "PLine_id" = $1;`
    pool.query(queryX, [lineId], (error, results) => {
        if (error) {
            throw error;
        }
        const lineName = results.rows[0].PLine_name;
        const query = 
        `SELECT "FReport_id", "FReport_time"
            FROM public."FinalReport"
            WHERE "FReport_name" = $1`;
        pool.query(query, [lineName], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    });
};


const getOperationsByLineId = (request, response) => {
    const lineId = request.body.PLine_id;
    const query = 
    `SELECT "Operation_id", "Operation_name"
        FROM public."Operation"
        WHERE "PLine_id_ProductionLine" =$1`       
    pool.query(query, [lineId], (error, results) => {
        if (error) {
            throw error;
            }
            response.status(200).json(results.rows);
        });
}


const getProcessesByLineId = (request, response) => {
    const lineId = request.body.PLine_id;
    const query1 = `
        SELECT "Operation_id"
        FROM public."Operation"
        WHERE "PLine_id_ProductionLine" =$1`;
    const query2 = `
        SELECT "Process_id", "Process_name", "Operation_id_Operation", "Process_type"
        FROM public."Process"
        WHERE "Operation_id_Operation" = $1`;
    pool.query(query1, [lineId], (error, results) => {
        if (error) {
            throw error;
        }
        const operationIds = results.rows.map(row => row.Operation_id);
        const processes = [];
        let count = 0;
        operationIds.forEach(operationId => {
            pool.query(query2, [operationId], (error, results) => {
                if (error) {
                    throw error;
                }
                processes.push(results.rows);
                count++;
                if (count === operationIds.length) {
                    response.status(200).json(processes);
                }
            });
        });
    });
};


const createNewProcess = (request, response) => {
    const values = [request.body.Process_name, request.body.Operation_id, request.body.Process_type]
    const query = `
        INSERT INTO public."Process"(
            "Process_name", "Operation_id_Operation", "Process_type")
            VALUES ($1, $2, $3);`
    pool.query(query, values, (error, results) => {
        if (error) {
            throw error;
            }
            response.status(200).json(results.rows);
        });
}


const deleteProcess = (request, response) => {
    const values = [request.body.Process_id]
    const query = `
        DELETE FROM public."Process"
        WHERE "Process_id" = $1;`
    pool.query(query, values, (error, results) => {
        if (error) {
            throw error;
            }
            response.status(200).json(results.rows);
        });
}


const changeProcess = (request, response) => {
    const values = [request.body.Process_id,request.body.Process_name,request.body.Process_type]
    const query = `
        UPDATE public."Process"
        SET "Process_name" = $2, "Process_type" = $3
        WHERE "Process_id" = $1;`
    pool.query(query, values, (error, results) => {
        if (error) {
            throw error;
            }
            response.status(200).json(results.rows);
        });
}


const createNewOperation = (request, response) => {
    const values = [request.body.Operation_name, request.body.LinkaId]
    const query = `
        INSERT INTO public."Operation"(
            "Operation_name", "PLine_id_ProductionLine")
            VALUES ($1, $2);`
    pool.query(query, values, (error, results) => {
        if (error) {
            throw error;
            }
            response.status(200).json(results.rows);
        });
}


const deleteOperation = (request, response) => {
    const values = [request.body.Operation_id]
    const query = `
    DELETE FROM public."Operation"
    WHERE "Operation_id" =$1;`
    pool.query(query, values, (error, results) => {
        if (error) {
            throw error;
            }
            response.status(200).json(results.rows);
        });
}


const createNewLine = (request, response) => {
    const values = [request.body.PLine_name]
    const query = `
    INSERT INTO public."ProductionLine"(
        "PLine_name")
        VALUES ($1);`
    pool.query(query, values, (error, results) => {
        if (error) {
            throw error;
            }
            response.status(200).json(results.rows);
        });
}

  
 const createExport = (request, response) => {
    const linkId = request.body.PLine_id;
    const query = `
      SELECT "FReport_time", "FReport_name"
        FROM public."FinalReport"
        WHERE "FReport_id" = $1;`;
    pool.query(query, [linkId], (error, results) => {
      if (error) {
        throw error;
      }
      const time = results.rows[0].FReport_time;
      const name = results.rows[0].FReport_name;
      const queryX = `
        SELECT "RData_Operation", "RData_process", "RData_data"
        FROM public."ReportData"
        WHERE "FReport_id_FinalReport" = $1
        ORDER BY "RData_Operation" ASC`;
      pool.query(queryX, [linkId], (error, results) => {
        if (error) {
          throw error;
        }
        const data = results.rows;
        // Create a new Excel workbook
        const workbook = new Excel.Workbook();
        // Add a sheet to the workbook
        const sheet = workbook.addWorksheet('Sheet 1');
        const thirdrowData = ["Operace", "Proces", "OK/NOK"];
        // Add first row
        const firstRow = sheet.addRow(["Report pro linku: ", name]);
        const secondRow = sheet.addRow(["Report zde dne: ", time]);
        const thirdRow = sheet.addRow(thirdrowData)
        for (let i = 1; i <= thirdrowData.length; i++) {  // Loop through all the cells in the row
            const cell = thirdRow.getCell(i);
            if (cell.value) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' } };
                cell.font = { bold: true, size: 13 };
                cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        }
        sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' } };
        sheet.getCell('A1').font = { bold: true, size: 13 };
        sheet.getCell('A1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        sheet.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' } };
        sheet.getCell('A2').font = { bold: true, size: 13 };
        sheet.getCell('A2').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        sheet.addRows(data.map(row => Object.values(row)));
        let firstRowMerge = sheet.getRow(4);
        let firstCell = firstRowMerge.getCell(1);
        let firstCellValue = firstCell.value;
        let mergeStart = firstCell;
        let mergeEnd = firstCell;        
        for (let i = 5; i <= sheet.actualRowCount; i++) {
            let currentRow = sheet.getRow(i);
            let currentCell = currentRow.getCell(1);
            let currentValue = currentCell.value;
        
            if (firstCellValue === currentValue) {
                mergeEnd = currentCell;
            } else {
                sheet.mergeCells(mergeStart.address, mergeEnd.address);
                    mergeStart.style = { 
                    font: { bold: true }, 
                    alignment: { vertical: 'middle', horizontal: "center" }, 
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C5C5C5' }},

                    };
                firstCellValue = currentValue;
                firstCell = currentCell;
                mergeStart = firstCell;
                mergeEnd = firstCell;
            }
        }        
        // Merge the last group of cells
        sheet.mergeCells(mergeStart.address, mergeEnd.address);
                mergeStart.style = { 
                font: { bold: true }, 
                alignment: { vertical: 'middle', horizontal: "center" }, 
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C5C5C5' }},
                };
        sheet.columns.forEach(function (column, i) {
            var maxLength = 0;
            column["eachCell"]({ includeEmpty: true }, function (cell) {
                var columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength ) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength;
        });  
        // Set the file type, file name, and content type
        const fileType = 'application/octet-stream';
        const fileExtension = '.xlsx';
        const fileName = 'Report';   
        // Write the Excel file to a buffer
        workbook.xlsx.writeBuffer().then(buffer => {
          // Set the response headers
          response.setHeader('Content-Type', fileType);
          response.setHeader('Content-Disposition', `attachment; filename=${fileName}${fileExtension}`);    
          // Send the buffer as the response
          response.send(buffer);  
        });
      });
    });
  };


    module.exports = {
        getTypyLinek,
        getTemplateAboutLinka,
        insetFinalData,
        getNameOfLine,
        
        adminReports,

        getOperationsByLineId,
        getProcessesByLineId,

        createNewProcess,
        deleteProcess,
        changeProcess,
        createNewOperation,
        deleteOperation,
        createNewLine,

        createExport,
      }
