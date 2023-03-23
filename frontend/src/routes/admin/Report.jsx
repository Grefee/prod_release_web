import {
    QueryClient,
    QueryClientProvider,
    useQuery,
  } from "@tanstack/react-query";
  import Swal from 'sweetalert2'
  import { useState } from "react"

  import { useParams } from 'react-router-dom';

async function getAdminReports(IP, lineId) {
    const response = await fetch(`http://${IP}:3005/adminReports`, {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                PLine_id: lineId,
            }),
        });
        return response.json();
    }

async function getNameOfLine(IP, lineId) {
    const response = await fetch(`http://${IP}:3005/getNameOfLine`, {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                PLine_id: lineId,
            }),
        });
        return response.json();
    }
    
const createExport = async (lineId) => {
    try {
        Swal.fire({
        title: "Please wait",
        text: "Your file is being fetched",
        onOpen: () => {
            Swal.showLoading();
        },
        });
        const response = await fetch(`http://${IP}:3005/createExport`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({PLine_id: lineId}),
        });
        if (!response.ok) {
        throw new Error(response.statusText);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.setAttribute("download", "report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Swal.close();
    } catch (error) {
        console.error(error);
        Swal.fire({
        title: "Error",
        text: "Failed to fetch the file",
        icon: "error",
        });
    } finally {
    }
    };
const IP = process.env.REACT_APP_BACKEND_API

function Reports() {
    const { lineId } = useParams();
    const {isLoading: reportsLoad, data: reports} = useQuery({queryKey: ['reports'], queryFn: async () => await getAdminReports(IP, lineId), initialData: []});
    const {isLoading: lineNameLoad, data: lineName} = useQuery({queryKey: ['lineName'], queryFn: async () => await getNameOfLine(IP, lineId), initialData: []});
    const [filter, setFilter] = useState('')
    
    function filterData(event) {
        setFilter(event.target.value);
        console.log(filter)
      }
    
    function clearFilter(){
        setFilter('')
    }
    
if (lineNameLoad || reportsLoad) {
    return <span>Loading...</span>
    }

    return (
        <div className="ml-16 mt-16 w-11/12">
            <div className=" relative border w-5/6 rounded-3xl overflow-hidden">
                <table className="w-full text-lg text-left text-black-500 dark:text-gray-400 overflow-hidden ">
                    <thead>
                        <tr className="bg-slate-500 border-b">
                            <td className="pl-5 pt-2 pb-2 text-center" colspan="3">{lineName.length > 0 ? lineName[0].PLine_name : 'N/A'}</td>
                        </tr>
                        <tr className="bg-slate-500 border-b">
                            <td className="pl-5 pt-2 pb-2">Enter date:</td>
                            <td className="pl-5 pt-2 pb-2"><input type="date" id="filter-date" value={filter} onChange={(e)=>filterData(e)} /></td>
                            <td className="pl-3 pt-2 pb-2"><button className="bg-slate-300 hover:bg-slate-400 rounded-full pt-2 pb-2 pl-5 pr-5" onClick={clearFilter}>clear filter</button></td>
                        </tr>
                    </thead>
                    <tbody>
                    {filter ? 
                        reports.filter(report => {
                        const dateStr = report.FReport_time; // "01. 02. 2023 14:03"
                        if (!dateStr) return false; // skip reports with empty FReport_time
                        const day = dateStr.substring(0, 2);
                        const month = dateStr.substring(4, 6);
                        const year = dateStr.substring(8, 12);

                        const isoDate = `${year}-${month}-${day}`; // "2023-02-01"
                        const dateObj = new Date(isoDate);
                        const filterDate = new Date(filter);
                        return dateObj.toDateString() === filterDate.toDateString();
                        }).map((report) => {
                        return (
                            <tr className={` border-b  hover:bg-slate-200`}>
                                <td className="px-3 py-3">{report.FReport_id}</td>
                                <td className="px-3 py-3">{report.FReport_time}</td>
                                <td className="px-3 py-3"><button className="bg-slate-300 hover:bg-slate-400 rounded-full pt-2 pb-2 pl-5 pr-5" onClick={() => createExport(report.FReport_id)}>Export</button></td>
                            </tr>
                        )
                        }) 
                        : reports.map((report) => {
                        return (
                            <tr className={` border-b  hover:bg-slate-200`}>
                                <td className="px-3 py-3">{report.FReport_id}</td>
                                <td className="px-3 py-3">{report.FReport_time}</td>
                                <td className="px-3 py-3"><button className="bg-slate-300 hover:bg-slate-400 rounded-full pt-2 pb-2 pl-5 pr-5" onClick={() => createExport(report.FReport_id)}>Export</button></td>
                            </tr>
                        )
                        })
                    }
                    {filter && 
                        !reports.some(report => {
                        const dateStr = report.FReport_time; // "01. 02. 2023 14:03"
                        if (!dateStr) return false; // skip reports with empty FReport_time
                        const day = dateStr.substring(0, 2);
                        const month = dateStr.substring(4, 6);
                        const year = dateStr.substring(8, 12);

                        const isoDate = `${year}-${month}-${day}`; // "2023-02-01"
                        const dateObj = new Date(isoDate);
                        const filterDate = new Date(filter);
                        return dateObj.toDateString() === filterDate.toDateString();
                        }) && 
                        <tr className={` border-b  hover:bg-slate-200`}>
                                <td className="px-3 py-3 text-center" colspan="3">no data found</td>
                            </tr>
                    }
                    </tbody>
                </table>
            </div>
        </div>
        );
    }

export default Reports;
