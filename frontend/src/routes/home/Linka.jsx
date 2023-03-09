import React, { useState ,useEffect } from "react";
import _ from 'lodash';
import Swal from 'sweetalert2'

function Linka(props) {
    const linkaId = props.linkaId
    const goToHome = props.goToHome
    const apiIP = props.apiIP

    const [loading, setLoading] = useState(true);
    const [typyLinek, setTypyLinek] = useState([]);
    const [selected, setSelected] = useState({});
    const isAllSelected = Object.values(selected).every((value) => value !== "None" && value !== "");
    



    async function getTypyLinek() {
        try {
            const response = await fetch('http://'+apiIP+':3005/getTemplateAboutLinka', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    PLine_id: linkaId,
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch data, status code: ${response.status}`);
            }
    
            const data = await response.json();
            setTypyLinek(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }
    useEffect(() => {
        getTypyLinek();
    },[]);


    useEffect(() => {
        console.log(selected)
    },[selected])

    useEffect(() => {
        if (!loading) {
            const initialSelected = {};
            typyLinek.forEach(({ Process_id }) => {
                initialSelected[Process_id] = "None";
            });
            setSelected(initialSelected);
        }
    }, [loading, typyLinek, setSelected]);

    const groupedData = _.groupBy(typyLinek, 'Operation_id');
    const operationIds = Object.keys(groupedData);


    const [currentPage, setCurrentPage] = useState(1);
    const operationsPerPage = 1;
    
    const numberOfPages = operationIds.length;
    const indexOfLastOperation = currentPage * operationsPerPage;
    const indexOfFirstOperation = indexOfLastOperation - operationsPerPage;
    const currentOperations = operationIds.slice(indexOfFirstOperation, indexOfLastOperation);
 
    
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleButtonClick = (processData, type) => {
        setSelected( prevSelected => ({
            ...prevSelected, [processData.Process_id]: type }));
      };

      const handleTextChange = (processData, type) => {
        setSelected({ ...selected, [processData.Process_id]: type });
      };


    const sendData = () => {
        Swal.fire({
            title: 'Sending Data',
            icon: 'info',
            text: 'Please wait...',
            showConfirmButton: false,
            allowOutsideClick: false
          });
        const actualTime = new Date();
        const options = { timeZone: 'Europe/Prague', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        const pragueTime = actualTime.toLocaleString('cs-CZ', options);
        const userName = "test";

        const selectedArray = Object.entries(selected).map(([process_id, process_data]) => ({
            process_id: process_id,
            process_data,
            }));

        const finalData = selectedArray.map((selectedItem) => {
            const selectedProcess = typyLinek.find(
                (typLinekItem) => typLinekItem.Process_id === selectedItem.process_id
            ) || {};
            console.log(selectedItem.process_id)
            return {
                
                "report_time": pragueTime,
                "report_user": userName,
                "report_linka": typyLinek[0].PLine_name,
                "report_operation": selectedProcess.Operation_name,
                "report_process": selectedProcess.Process_name,
                "report_data": selectedItem.process_data
            };
        });
        console.log(finalData)
        fetch('http://'+apiIP+':3005/insertFinalData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalData)
          })
            .then(res => {
              if (res.status === 200) {
                Swal.fire({
                  title: 'Data Sent Successfully!',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  showConfirmButton: true,
                }).then(function() {
                    goToHome();
                  });
              } else if (res.status === 400) {
                Swal.fire({
                  title: 'Error Sending Data',
                  icon: 'error',
                  confirmButtonText: 'Close'
                });
              } else if (res.status === 404) {
                Swal.fire({
                  title: 'Error Sending Data',
                  icon: 'error',
                  confirmButtonText: 'Close'
                });
        }});
        };
        


    





    if (loading) {
        return <div>Loading...</div>;
      }
    return (
        
        <div className="flex flex-col items-center h-screen">
            <div className='w-screen bg-gradient-to-r from-gray-700 to-gray-500 pt-14 pb-10 flex flex-row justify-center'>
                <div className="flex justify-center align-middle">
                    <button className="rounded-full bg-black text-white mr-40 pt-3 pb-3 pl-3 pr-3" onClick={goToHome}> Home btn</button>
                    <h1 className="font-serif text-3xl">{typyLinek[0].PLine_name}</h1>
                    {isAllSelected && (
                    <button className="bg-white border border-black ml-40 py-2 px-4 rounded-full"
                    onClick={() => sendData()}>
                    Send
                    </button>
                    )}
                </div>
            </div>
            <div className="flex mt-10 mb-10">
                <button
                    className="bg-white border border-black py-2 px-4 rounded-lg"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    >
                    Prev
                </button>
                <a className="py-2 px-4">{currentPage}/{numberOfPages}</a>
                <button
                    className="bg-white border border-black py-2 px-4 rounded-lg"
                    disabled={currentPage === operationIds.length}
                    onClick={() => handlePageChange(currentPage + 1)}
                    >
                    Next
                </button>
            </div>
            <div className="flex flex-row justify-start w-11/12 h-full mb-24">
                <div className="flex bg-green-200 text-3xl w-1/6 items-center justify-center mr-5 rounded-lg">
                    {groupedData[operationIds[currentPage - 1]][0].Operation_name}
                </div>
                <div className="flex flex-col h-full justify-center w-full">
                    {groupedData[operationIds[currentPage - 1]].map(processData => {
                        return (
                            <div className="flex flex-row">
                                <div className="border mt-2 mb-2 w-full bg-slate-200" id={processData.Process_id}>
                                    <div className="flex justify-between w-full">
                                        <a className="w-3/4">{processData.Process_name}</a>
                                        {processData.Process_type === 'btn' ? (
                                            <div className="flex mr-5">
                                            
                                                
                                                <button className={`border border-black py-2 px-4 rounded-lg ${
                                                    selected[processData.Process_id] === "Y" ? "bg-green-500" : "bg-white"
                                                }`}
                                                onClick={() => handleButtonClick(processData, "Y")}
                                                >
                                                Y
                                                </button>
                                                <button className={`border border-black py-2 px-4 rounded-lg ml-5 ${
                                                    selected[processData.Process_id] === "N" ? "bg-red-500" : "bg-white"
                                                }`}
                                                onClick={() => handleButtonClick(processData, "N")}
                                                >
                                                N
                                                </button>
                                            </div>
                                        ) : (
                                        <div className="flex mr-5">
                                            <textarea 
                                                className={`border border-black py-2 px-4 rounded-lg w-full ${
                                                    selected[processData.Process_id] === "None" || selected[processData.Process_id] === "" 
                                                    ? "bg-red-500" : "bg-green-500"
                                                }`}
                                                value={selected[processData.Process_id] === "None" ? "" : selected[processData.Process_id]}
                                                onChange={(e) => handleTextChange(processData, e.target.value)}
                                                name="textarea"
                                                />
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                </div>
            </div>
        </div>
    );
}


export default Linka;

